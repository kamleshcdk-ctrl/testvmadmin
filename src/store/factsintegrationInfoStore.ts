import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FactIntegrationConfig } from "~/types";

export interface FactsIntegrationLocation {
  schoolCode: string;
  schoolName: string;
  defaultTermId: string;
  defaultYearId: string;
  configSchoolID: string;
}

export const useFactsSchoolsStore = defineStore('factsSchoolsStore', () => {

  // State:
  const loadingActions = ref<string[]>([]);
  const schools = ref<FactsIntegrationLocation[]>([]);
  const activeTenantApiKey = ref("")
  const activeIntegrationUrl = ref("")
  const activeIntegrationSubscriptionKey = ref("")
  const numberStudentsInfoLoaded = ref<number>(0);

  const loading = computed(() => loadingActions.value.length > 0);
  const connected = ref(false);
  // eslint-disable-next-line
  const students = ref<any[]>([]);
  // eslint-disable-next-line
  const attendanceRecords = ref<any[]>([]); // <-- New variable for attendance
  // eslint-disable-next-line
  const attendanceCheckResults = ref<any[]>([]);

  // Actions:
  async function setup(jobParameters: FactIntegrationConfig) {
    activeIntegrationUrl.value = jobParameters.baseUrl
    activeTenantApiKey.value = jobParameters.apiKey
    activeIntegrationSubscriptionKey.value = jobParameters.subscriptionKey
  }

  async function connect(jobParameters: FactIntegrationConfig) {
    connected.value = true
    await setup(jobParameters);
  }

  async function loadSchools() {
    loadingFor('loadSchools');

    try {
      const response = await $fetch<{
        // eslint-disable-next-line
        data: { results: any[] };
        success: boolean;
      }>('/api/integration/facts/schools', {
        method: 'POST',
        body: {
          baseUrl: activeIntegrationUrl.value,
          pageSize: 10,
          headers: {
            "Facts-Api-Key": activeTenantApiKey.value,
            "Ocp-Apim-Subscription-Key": activeIntegrationSubscriptionKey.value,
          },
        },
      });
      if (response.success && Array.isArray(response.data.results)) {
        schools.value = response.data.results.map((item) => ({
          schoolCode: item.schoolCode,
          schoolName: item.schoolName,
          defaultTermId: item.defaultTermId,
          defaultYearId: item.defaultYearId,
          configSchoolID: item.configSchoolID
        }));
      } else {
        schools.value = [];
      }
    } catch {
      schools.value = [];
    } finally {
      loadingFor('loadSchools', false);
    }
  }

  async function loadStudents(pageSize: number = 1000, configSchoolId: string) {

    // reset everything when loading new list of students
    students.value = [];
    attendanceRecords.value = [];
    attendanceCheckResults.value = [];

    try {
      const response = await $fetch<{
        // eslint-disable-next-line
        data: { results: any[] };
        success: boolean;
      }>('/api/integration/facts/students', {
        method: 'POST',
        body: {
          baseUrl: activeIntegrationUrl.value, // you must define this
          headers: {
            "Facts-Api-Key": activeTenantApiKey.value, // define or inject this
            "Ocp-Apim-Subscription-Key": activeIntegrationSubscriptionKey.value, // define or inject
          },
          pageSize,
          filters: `configSchoolId==${configSchoolId},status==Enrolled`,
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.success && Array.isArray(response.data)) {
        students.value = response.data.map((item) => ({
          studentId: item.studentId,
          studentFirstName: item.demographics.person.firstName,
          studentLastName: item.demographics.person.lastName,
        }));
      } else {
        students.value = [];
      }
    } catch {
      students.value = [];
    }
  }

  async function loadStudentsByName(name: string, configSchoolId: string) {

    // reset everything when loading new list of students
    students.value = [];
    attendanceRecords.value = [];
    attendanceCheckResults.value = [];


    const pageSize = 100;
    try {
      const peopleResponse = await $fetch<{
        // eslint-disable-next-line
        data: { results: any[] };
        success: boolean;
      }>('/api/integration/facts/people', {
        method: 'POST',
        body: {
          baseUrl: activeIntegrationUrl.value, // you must define this
          headers: {
            "Facts-Api-Key": activeTenantApiKey.value, // define or inject this
            "Ocp-Apim-Subscription-Key": activeIntegrationSubscriptionKey.value, // define or inject
          },
          pageSize,
          filters: `(LastName)_=${name}`,
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const personIds: string[] = []
      // @ts-expect-error type for peopleResponse?.data
      peopleResponse?.data?.forEach((person) => {
        personIds.push(person.personId)
      });

      const response = await $fetch<{
        // eslint-disable-next-line
        data: { results: any[] };
        success: boolean;
      }>('/api/integration/facts/students', {
        method: 'POST',
        body: {
          baseUrl: activeIntegrationUrl.value,
          headers: {
            "Facts-Api-Key": activeTenantApiKey.value,
            "Ocp-Apim-Subscription-Key": activeIntegrationSubscriptionKey.value,
          },
          pageSize,
          filters: `configSchoolId==${configSchoolId},status==Enrolled,studentId==${personIds.join('|')}`,
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.success && Array.isArray(response.data)) {
        students.value = response.data.map((item) => ({
          studentId: item.studentId,
          studentFirstName: item.demographics.person.firstName,
          studentLastName: item.demographics.person.lastName,
        }));
      } else {
        students.value = [];
      }
    } catch {
      students.value = [];
    }
  }


  async function fetchAttendanceByDates(
    startDate: string,
    endDate: string,
    studentIds: string[]
  ) {
    loadingFor('fetchAttendanceByDates');
    attendanceRecords.value = [];
    numberStudentsInfoLoaded.value = 0;

    const baseFilters = `attendanceDate>=${startDate}T00:00:00Z , attendanceDate<=${endDate}T23:59:59Z`;

    const batchSize = 5;

    // Split studentIds into chunks of 5
    const studentChunks: string[][] = [];
    for (let i = 0; i < studentIds.length; i += batchSize) {
      studentChunks.push(studentIds.slice(i, i + batchSize));
    }

    try {
      // eslint-disable-next-line
      const allResults: any[] = [];

      for (const chunk of studentChunks) {
        // Map chunk of students to API calls
        const requests = chunk.map((studentId) => {
          const filters = `${baseFilters} , studentId==${studentId}`;

          return $fetch<{
            success: boolean;
            // eslint-disable-next-line
            data: { results: any[] };
          }>('/api/integration/facts/student-schedule-day', {
            method: 'POST',
            body: {
              baseUrl: activeIntegrationUrl.value,
              headers: {
                "Facts-Api-Key": activeTenantApiKey.value,
                "Ocp-Apim-Subscription-Key": activeIntegrationSubscriptionKey.value,
              },
              filters,
              sorts: "",
              page: 1,
              pageSize: 100000,
            },
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }).then((response) => {
            if (response.success && Array.isArray(response.data)) {
              return response.data.map((item) => ({
                studentId: item.studentReference.studentId,
                attendanceDate: item.attendanceDate,
                attendanceCodeName: item.attendanceCodeName ?? item.attendanceEventReason,
                data: item,
              }));
            } else {
              return [];
            }
          }).catch((error) => {
            // eslint-disable-next-line
            console.error(`Failed to fetch attendance for studentId=${studentId}`, error);
            return [];
          });
        });

        // Wait for this batch to complete
        const batchResults = await Promise.all(requests);
        numberStudentsInfoLoaded.value += batchResults.length;

        // Flatten the batch results and append
        allResults.push(...batchResults.flat());
        await delay(2000)
      }

      attendanceRecords.value = allResults;
    } catch (error) {
      // eslint-disable-next-line
      console.error('Unexpected error in fetchAttendanceByDates:', error);
      attendanceRecords.value = [];
    } finally {
      loadingFor('fetchAttendanceByDates', false);
    }
  }

  async function fetchAttendanceCheck(studentIds: string[], termId: string, yearId: string) {
    loadingFor('fetchAttendanceCheck');

    const batchSize = 10;
    // eslint-disable-next-line
    const allResults: any[] = [];
    numberStudentsInfoLoaded.value = 0;

    try {
      const studentChunks = chunkArray(studentIds, batchSize);

      for (let i = 0; i < studentChunks.length; i++) {
        const chunk = studentChunks[i];

        // Create parallel API calls for this batch
        const promises = chunk.map(studentId =>
          $fetch<{
            success: boolean;
            // eslint-disable-next-line
            data: any;
          }>('/api/integration/facts/attendance-check', {
            method: 'POST',
            body: {
              baseUrl: activeIntegrationUrl.value,
              headers: {
                "Facts-Api-Key": activeTenantApiKey.value,
                "Ocp-Apim-Subscription-Key": activeIntegrationSubscriptionKey.value,
              },
              studentId: studentId, // <- Pass single studentId as filter
              yearId: yearId,
              termId: termId,
            },
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }).then(response => {
            if (response.success && response.data) {
              return response.data;
            } else {
              // eslint-disable-next-line
              console.warn(`Failed to fetch attendance for student ${studentId}`);
              return null;
            }
          }).catch(err => {
            // eslint-disable-next-line
            console.error(`Error fetching student ${studentId}:`, err);
            return null;
          })
        );

        const batchResults = await Promise.all(promises);

        allResults.push(...batchResults.filter(Boolean)); // Remove nulls

        numberStudentsInfoLoaded.value += batchResults.length;

        await delay(2000); // Throttle batches to avoid rate limits


      }

      // Transform results
      attendanceCheckResults.value = allResults.map(item => ({
        studentId: item.studentId,
        hasHomeRoomWithAttendance: item.hasHomeRoomWithAttendance ?? false,
        data: item.courses,
        enrolledClasses: item?.enrolledClasses
      }));
    } catch (error) {
      // eslint-disable-next-line
      console.error("fetchAttendanceCheck error:", error);
      attendanceCheckResults.value = [];
    } finally {
      loadingFor('fetchAttendanceCheck', false);
    }
  }


  // Helper
  function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


  function loadingFor(actionName: string, loadingNow: boolean = true) {
    if (loadingNow) {
      loadingActions.value.push(actionName);
    } else {
      const index = loadingActions.value.indexOf(actionName);
      if (index > -1) loadingActions.value.splice(index, 1);
    }
  }

  return {
    connect,
    schools,
    numberStudentsInfoLoaded,
    loading,
    loadSchools,
    students,
    loadStudents,
    loadStudentsByName,
    fetchAttendanceByDates,
    attendanceRecords,
    attendanceCheckResults,
    fetchAttendanceCheck,
  };
});
