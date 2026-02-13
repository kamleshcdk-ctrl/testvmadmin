
<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { useFactsSchoolsStore } from '~/store/factsintegrationInfoStore';
import type { FactIntegrationConfig } from '~/types';
import Column from 'primevue/column';
import { Temporal } from '@js-temporal/polyfill';

const runtimeConfig = useRuntimeConfig();
const toast = useToast();
const factsBaseUrl = "https://api.factsmgt.com";
const factsSubscriptionKey = `${runtimeConfig.public.FACTS_SUBSCRIPTION_KEY}`;
const route = useRoute();
const locationId = route.params.id;
const { getLocationById } = useLocationByIdQuery();
const { result: location } = getLocationById(route.params.id);
const popupSource = ref<'attendanceStatus' | 'other' | null>(null);

const factsSchoolsStore = useFactsSchoolsStore();
const loadingMap = ref<Record<string, boolean>>({});
loadingMap.value['fetchAttendanceByDatesDay'] = false;
loadingMap.value['fetchAttendanceByDatesWeek'] = false;
const { getIntegrationsForLocation } = useIntegrationsForLocationQuery();

const selectedIntegrationLocation = ref<{ label: string; id: string; defaultTermId: string; defaultYearId: string; configSchoolID: string } | null>(null);

const dayScheduleLoaded = ref(false);
const weekScheduleLoaded = ref(false);
const showAttendanceDetailsDialog = ref(false);
// eslint-disable-next-line
const selectedAttendanceDetails = ref<any>(null);

const studentSearchName = ref('');

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const integrationLocationOptions = computed(() =>
  factsSchoolsStore.schools.map((school) => ({
    id: school.schoolCode,
    label: school.schoolName,
    defaultTermId: school.defaultTermId,
    defaultYearId: school.defaultYearId,
    configSchoolID: school.configSchoolID
  }))
);


async function connectToIntegration(
  locationIntegrationParams: { appUrl: string; apiKey: string; subscriptionKey: string }
) {
  const connectionParameters: FactIntegrationConfig = {
    baseUrl: locationIntegrationParams.appUrl,
    apiKey: locationIntegrationParams.apiKey,
    subscriptionKey: locationIntegrationParams.subscriptionKey,
  };
  await factsSchoolsStore.connect(connectionParameters);
}

onMounted(async () => {
  const { onResult } = await getIntegrationsForLocation(locationId);
  onResult(async (integrationResult) => {
    if (!integrationResult.loading && integrationResult.data?.adminLocation) {

      const integrations = integrationResult?.data?.adminLocation?.integrations;

      // @ts-expect-error integration type
      const factsIntegrations = integrations.filter((integration) =>
        integration?.slug === 'facts');

      const firstIntegration: FactIntegrationConfig = factsIntegrations[0]?.data;
      if (firstIntegration && !integrationResult.loading) {
        const factsIntegrationParams = {
          appUrl: factsBaseUrl,
          apiKey: firstIntegration.apiKey,
          subscriptionKey: factsSubscriptionKey,
        };
        await connectToIntegration(factsIntegrationParams);
        await factsSchoolsStore.loadSchools();
        // Assuming this exists and has expected structure:
        // Set selectedIntegrationLocation after connection
        if (factsSchoolsStore.schools.length > 0) {
          selectedIntegrationLocation.value = {
            id: factsSchoolsStore.schools[0].schoolCode,
            label: factsSchoolsStore.schools[0].schoolName,
            defaultTermId: factsSchoolsStore.schools[0].defaultTermId,
            defaultYearId: factsSchoolsStore.schools[0].defaultYearId,
            configSchoolID: factsSchoolsStore.schools[0].configSchoolID
          };
        }
      }
    }
  });
});

async function loadStudentsByPageSize(pageSize: number) {
  loadingMap.value['loadStudents'] = true;
  dayScheduleLoaded.value = false;
  weekScheduleLoaded.value = false;

  try {
    if (selectedIntegrationLocation.value) {
      const configSchoolID = await selectedIntegrationLocation.value.configSchoolID;

      // eslint-disable-next-line
      // @ts-ignore
      await factsSchoolsStore.loadStudents(pageSize, configSchoolID);
      loadingMap.value['fetchAttendanceByDatesWeek'] = false;
      const studentIds = factsSchoolsStore.students.map(student => student.studentId);
      // Show loading while fetching
      await fetchAttendanceWithLoading(studentIds);
    }
  } catch (error) {
    // eslint-disable-next-line
    console.error("Failed to load students or fetch attendance check:", error);
  } finally {
    loadingMap.value['loadStudents'] = false;
  }
}

async function loadStudentsByName() {
  loadingMap.value['loadStudents'] = true;
  dayScheduleLoaded.value = false;
  weekScheduleLoaded.value = false;
  
  try {
    if (selectedIntegrationLocation.value) {
      const configSchoolID = await selectedIntegrationLocation.value.configSchoolID;

      await factsSchoolsStore.loadStudentsByName(studentSearchName.value, configSchoolID);

      loadingMap.value['fetchAttendanceByDatesWeek'] = false;
      const studentIds = factsSchoolsStore.students.map(student => student.studentId);
      // Show loading while fetching
      await fetchAttendanceWithLoading(studentIds);
    }
  } catch (error) {
    // eslint-disable-next-line
    console.error("Failed to load students or fetch attendance check:", error);
  } finally {
    loadingMap.value['loadStudents'] = false;
  }
}


// Attendance
const attendanceDate = ref<string>(new Date().toISOString().split('T')[0]);
const fetchAttendanceEnabled = ref<boolean>(true);

const formattedAttendanceDate = computed(() => {
  if (!attendanceDate.value) return '';
  const date = new Date(attendanceDate.value);
  return date.toISOString().split('T')[0];
});

const attendanceDateColumnLabel = computed(() => {
  return formattedAttendanceDate.value || 'Selected Date';
});

const weeklyAttendanceColumns = ref<string[]>([]);

function get7DaysFromDate(startDateStr: string): string[] {
  const startDate = new Date(startDateStr);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}
// eslint-disable-next-line
function openAttendanceDetails(details: any) {
  selectedAttendanceDetails.value = details;
  showAttendanceDetailsDialog.value = true;
}

async function fetchAttendanceWithLoading(studentIds: string[]) {
  loadingMap.value['attendanceCheck'] = true;

  try {
    // Fetch attendance check data
    await factsSchoolsStore.fetchAttendanceCheck(studentIds.map(String), selectedIntegrationLocation.value?.defaultTermId ?? "", selectedIntegrationLocation.value?.defaultYearId ?? "");

    // Enrich studentScheduleDays with attendance check results
    factsSchoolsStore.students = factsSchoolsStore.students.map(student => {
      const attendanceCheck = factsSchoolsStore.attendanceCheckResults.find(
        record => record.studentId == student.studentId
      );
      return {
        ...student,
        hasHomeRoomWithAttendance: attendanceCheck?.hasHomeRoomWithAttendance ?? false,
        hasHomeRoomWithAttendanceData: { courses: attendanceCheck?.data || [], enrolledClasses: attendanceCheck?.enrolledClasses || [] },
      };
    });
  } catch (error) {
    // eslint-disable-next-line
    console.error("Failed to fetch attendance check data:", error);
  } finally {
    loadingMap.value['attendanceCheck'] = false;
  }
}

async function loadDaySchedule() {
  if (!formattedAttendanceDate.value) {
    // eslint-disable-next-line
    alert('Please select a date first.');
    return;
  }

  loadingMap.value['loadDaySchedule'] = true;

  try {
    const date = formattedAttendanceDate.value;
    const studentIds = factsSchoolsStore.students.map(student => student.studentId);
    loadingMap.value['fetchAttendanceByDatesWeek'] = true;
    await factsSchoolsStore.fetchAttendanceByDates(date, date, studentIds);

    factsSchoolsStore.students = factsSchoolsStore.students.map(student => {
      const attendance = factsSchoolsStore.attendanceRecords.find(
        (record) => record.studentId === student.studentId
      );
      return {
        ...student,
        attendanceDate: date,
        attendanceCodeName: attendance?.attendanceCodeName || '',
        attendanceData: attendance?.data || attendance || null,
      };
    });

    dayScheduleLoaded.value = true;
    weekScheduleLoaded.value = false;
    weeklyAttendanceColumns.value = [];
  } catch (error) {
    // eslint-disable-next-line
    console.error("Failed to load attendance day schedule:", error);
  } finally {
    loadingMap.value['loadDaySchedule'] = false;
    loadingMap.value['attendanceCheck'] = false;
    loadingMap.value['fetchAttendanceByDatesWeek'] = false;
    loadingMap.value[' fetchAttendanceByDatesDay'] = false;
  }
}

async function loadWeekSchedule() {
  if (!formattedAttendanceDate.value) {
    // eslint-disable-next-line
    alert('Please select a date first.');
    return;
  }

  loadingMap.value['loadWeekSchedule'] = true;

  try {
    const weekDates = get7DaysFromDate(formattedAttendanceDate.value);
    const firstDay = weekDates[0];
    const lastDay = weekDates[weekDates.length - 1];
    const studentIds = factsSchoolsStore.students.map(student => student.studentId);
    loadingMap.value['fetchAttendanceByDatesWeek'] = true;
    await factsSchoolsStore.fetchAttendanceByDates(firstDay, lastDay, studentIds);
    loadingMap.value['fetchAttendanceByDatesWeek'] = false;

    factsSchoolsStore.students = factsSchoolsStore.students.map(student => {
      const attendanceForStudent = factsSchoolsStore.attendanceRecords.filter(
        record => record.studentId === student.studentId
      );
      // eslint-disable-next-line
      const attendanceMap = new Map<string, { codeName: string; data: any }>();

      attendanceForStudent.forEach(record => {
        const dateOnly = record.attendanceDate.split('T')[0];
        attendanceMap.set(dateOnly, { codeName: record.attendanceCodeName, data: record.data || record });
      });

      return {
        ...student,
        attendanceMap,
      };
    });

    weeklyAttendanceColumns.value = weekDates;

    weekScheduleLoaded.value = true;
    dayScheduleLoaded.value = false;
  } catch (error) {
    // eslint-disable-next-line
    console.error("Failed to load weekly attendance schedule:", error);
  } finally {
    loadingMap.value['loadWeekSchedule'] = false;
  }
}

watch(attendanceDate, () => {
  dayScheduleLoaded.value = false;
  weekScheduleLoaded.value = false;
});

const popupVisible = ref(false);
// eslint-disable-next-line
const popupData = ref<any>(null);

// eslint-disable-next-line
function openPopup(data: any, source: 'attendanceStatus' | 'other' = 'other') {
  popupData.value = data;
  popupSource.value = source;
  popupVisible.value = true;
}

const { getUserWithSyncId } = useUserWithSyncIdQuery();

async function showVmDetails(sisUserId: string, targetDateStr: string) {
  try {
    const { error, onResult } = getUserWithSyncId({
      locationId: String(route.params.id),
      sisUserId: String(sisUserId),
      slug: 'facts',
    });

    // Parse and validate the target date (expects format: YYYY-MM-DD)
    let targetDate: Temporal.PlainDate;
    try {
      targetDate = Temporal.PlainDate.from(targetDateStr);
    } catch {
      // eslint-disable-next-line
      console.error('Invalid target date:', targetDateStr);
      return;
    }

    onResult((res) => {
      if (res && !res.loading && res?.data && res?.data?.adminGetUsersWithSyncId) {
        const user = res?.data?.adminGetUsersWithSyncId;

        if (!user) {
          // eslint-disable-next-line
          console.error('No user data found for VM details.');
          return;
        }

        // Ensure attendance is an array
        const attendance = Array.isArray(user.attendance) ? user.attendance : [];
        // eslint-disable-next-line
        const matchingAttendance = attendance.filter((entry: any) => {
          if (!entry.time) return false;
          try {
            const entryDate = Temporal.Instant.from(entry.time)
              .toZonedDateTimeISO('UTC') // Adjust timezone as needed
              .toPlainDate();
            return entryDate.equals(targetDate);
          } catch {
            // eslint-disable-next-line
            console.warn('Invalid attendance time:', entry.time);
            return false;
          }
        });

        if (matchingAttendance.length > 0) {
          popupData.value = matchingAttendance;
          popupVisible.value = true;
        } else {
          // eslint-disable-next-line
          console.warn('No attendance data found for the specified date:', targetDateStr);
          toast.add({
            severity: 'info', summary: 'No Visitor Management Attendance event found',
            detail: `No vistior management attendance information for ${user?.name || 'unknown'}`, life: 3000
          });
        }
      }
    });

    if (error.value) {
      // eslint-disable-next-line
      console.error('Error loading VM details:', error.value);
    }
  } catch (err) {
    // eslint-disable-next-line
    console.error('Failed to fetch VM Details:', err);
  }
}

const anyLoading = computed(() => {
  return (loadingMap.value['attendanceCheck'] || loadingMap.value['fetchAttendanceByDatesDay'] || loadingMap.value['fetchAttendanceByDatesWeek'])
});

const isClassActiveForCurrentTerm = computed(() => {
  const enrolledClasses = popupData.value?.enrolledClasses;
  const defaultTermId = selectedIntegrationLocation.value?.defaultTermId;
  if (!enrolledClasses || !defaultTermId) return true; // avoid showing warning if data not ready
  const termField = `term${defaultTermId}`;
 // @ts-expect-error: implicit any on 'cls'
  return enrolledClasses.some(cls => cls[termField] === true);
 });

 // eslint-disable-next-line
 function attendanceStatusIcon(data: any) {
  const courses = data?.hasHomeRoomWithAttendanceData?.courses;
  const enrolledClasses = data?.hasHomeRoomWithAttendanceData?.enrolledClasses;

  // 1. No enrollment for current term
  if (!enrolledClasses || enrolledClasses.length === 0) return false;

  // 2. Course missing or empty
  if (!courses || courses.length === 0) return false;

  // 3. Homeroom disabled
  // eslint-disable-next-line
  if (!courses.some((c: any) => c.homeRoom)) return false;

  // 4. Attendance disabled
  // eslint-disable-next-line
  if (!courses.some((c: any) => c.attendance)) return false;

  // 5. Not active for current term
  const defaultTermId = selectedIntegrationLocation.value?.defaultTermId;
  if (defaultTermId) {
    const termField = `term${defaultTermId}`;
    // eslint-disable-next-line
    const active = enrolledClasses.some((cls: any) => cls[termField] === true);
    if (!active) return false;
  }

  return true; // All good → green check
}

</script>
<template>
<LayoutNormalCenter :page-name="capitalizeFirstLetter(location?.name)" page-description="Select Integration Location">
  <!-- Integration Location Dropdown -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
    <div class="flex flex-col gap-2 ">
      <label for="integrationLocation" class="font-medium text-sm">Integration Location</label>
      <Select id="integrationLocation" v-model="selectedIntegrationLocation" :options="integrationLocationOptions"
        option-label="label" placeholder="Select Integration Location" class="w-full" />
      Year and Term Id: {{ selectedIntegrationLocation?.defaultYearId }}
      - {{ selectedIntegrationLocation?.defaultTermId }},
      School Id: {{ selectedIntegrationLocation?.id }} {{ selectedIntegrationLocation?.configSchoolID }}

    </div>
  </div>

  <!-- Students By Name -->
  <div class="flex justify-around items-center pt-5">
    <div>
      <InputText id="studentSearchName" v-model='studentSearchName' type="text" class="w-96 min-w-96" />

      <button type="button"
        class="ml-5 w-50 bg-primary-500 hover:bg-primary-400 text-white font-medium text-sm py-2 px-2 rounded disabled:opacity-50"
        @click="loadStudentsByName()">
        Find by Last Name
      </button>
    </div>
  </div>

  <!-- Student Loading Buttons -->
  <div class="flex justify-between items-center pt-5">
    <button type="button"
      class="w-50 bg-slate-500 hover:bg-primary-400 text-white font-medium text-sm py-2 px-2 rounded disabled:opacity-50"
      @click="loadStudentsByPageSize(10)">
      Load 10 Students
    </button>

    <div class="flex-1 flex justify-center">
      <button type="button"
        class="w-50 bg-slate-500 hover:bg-primary-400 text-white font-medium text-sm py-2 px-2 rounded disabled:opacity-50"
        @click="loadStudentsByPageSize(100)">
        Load 100 Students
      </button>
    </div>

    <button type="button"
      class="w-50 bg-slate-500 hover:bg-primary-400 text-white font-medium text-sm py-2 px-2 rounded disabled:opacity-50"
      @click="loadStudentsByPageSize(100000)">
      Load All Students
    </button>
  </div>

  <!-- Attendance Toggle and Date -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-6">
    <div class="flex flex-col gap-2">
      <label class="font-medium text-sm text-gray-700">Fetch Attendance</label>
      <label class="inline-flex items-center cursor-pointer">
        <span class="ml-3 text-sm text-gray-700">{{ fetchAttendanceEnabled ? 'Enabled' : 'Disabled'
        }}</span>
      </label>
    </div>

    <div v-if="fetchAttendanceEnabled" class="flex flex-col gap-2">
      <label for="attendanceDate" class="font-medium text-sm text-gray-700">Attendance Date</label>
      <input id="attendanceDate" v-model="attendanceDate" type="date"
        class="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
    </div>
  </div>

  <!-- Day/Week Attendance Buttons -->
  <div v-if="fetchAttendanceEnabled" class="flex justify-between items-center pt-5">
    <button type="button"
      class="w-50 bg-primary-500 hover:bg-primary-400 text-white font-medium text-sm py-2 px-2 rounded disabled:opacity-50"
      :disabled="dayScheduleLoaded || factsSchoolsStore.students.length === 0 || anyLoading" @click="loadDaySchedule">
      Load Day Schedule
    </button>

    <div class="flex-1 flex justify-center">
      <button type="button"
        class="w-50 bg-slate-500 hover:bg-primary-400 text-white font-medium text-sm py-2 px-2 rounded disabled:opacity-50"
        :disabled="weekScheduleLoaded || factsSchoolsStore.students.length === 0 || anyLoading"
        @click="loadWeekSchedule">
        Load Week Schedule
      </button>
    </div>
  </div>

  <!-- Total Students -->
  <div class="mt-6">
    <h2 class="text-gray-700 font-medium text-sm mb-2">
      Total Students: {{ factsSchoolsStore.students.length }}
    </h2>

    <h2 class="text-gray-700 font-medium text-sm mb-2">
      Loaded Info for Students: {{ factsSchoolsStore.numberStudentsInfoLoaded }}
    </h2>

    <!-- Optional loading spinner for attendance check -->
    <div
      v-if="loadingMap['attendanceCheck'] || loadingMap['fetchAttendanceByDatesDay'] || loadingMap['fetchAttendanceByDatesWeek']"
      class="flex justify-center py-4">
      <i class="pi pi-spinner pi-spin text-orange-500 text-2xl"></i>
    </div>

    <div class="overlaycontainer">

      <!-- Student Data Table -->
      <DataTable :value="factsSchoolsStore.students" responsive-layout="scroll" class="p-datatable-sm">
        <!-- Student Name -->
        <Column header="Name">
          <template #body="slotProps">
            <div class="flex flex-1 items-center ">
              <div>
                {{ slotProps.data.studentFirstName }}
              </div>
            </div>
            <div class="flex flex-1 items-center ">
              <div>
                {{ slotProps.data.studentLastName }}
              </div>
            </div>
            <div class="flex flex-1 items-center ">
              <div>
                id: {{ slotProps.data.studentId }}
              </div>
            </div>
          </template>
        </Column>

        <!-- Day Schedule Attendance Column -->
        <Column v-if="fetchAttendanceEnabled && dayScheduleLoaded" :header="attendanceDateColumnLabel">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <!-- Icon click opens hasHomeRoomWithAttendanceData -->
              <i
                class="pi text-xl cursor-pointer"
                :class="attendanceStatusIcon(slotProps.data)
                          ? 'pi pi-check text-green-600'
                          : 'pi pi-times text-red-600'"
                @click="openPopup(slotProps.data.hasHomeRoomWithAttendanceData, 'attendanceStatus')">
              </i>

              <!-- Attendance code name click opens attendanceData -->
              <span v-if="slotProps.data.attendanceCodeName" class="cursor-pointer text-blue-600 underline"
                @click="openPopup(slotProps.data.attendanceData)">
                {{ slotProps.data.attendanceCodeName }}
              </span>
              <!-- VM Details label/link -->
              <span v-if="slotProps.data.attendanceCodeName" class="cursor-pointer text-indigo-600 underline ml-2"
                @click="showVmDetails(slotProps.data.studentId, attendanceDateColumnLabel)">
                VM Details
              </span>

              <!-- Fallback if no code name -->
              <span v-else>—</span>
            </div>
          </template>
        </Column>



        <!-- Weekly Attendance Columns -->
        <Column v-for="date in weeklyAttendanceColumns" :key="date"
          :header="date?.substring(0, 4) + ' ' + date?.substring(5)">
          <template #body="slotProps">
            <div class="flex flex-1 items-center ">
              <div>
                <!-- Icon click opens hasHomeRoomWithAttendanceData -->
                <i
                class="pi text-xl cursor-pointer"
                :class="attendanceStatusIcon(slotProps.data)
                          ? 'pi pi-check text-green-600'
                          : 'pi pi-times text-red-600'"
                @click="openPopup(slotProps.data.hasHomeRoomWithAttendanceData, 'attendanceStatus')">
              </i>
              </div>
            </div>
            <div class="flex flex-1 items-center ">
              <div>

                <!-- Code name click opens attendanceMap[date] -->
                <span v-if="slotProps.data.attendanceMap?.get(date)?.codeName"
                  class="cursor-pointer text-blue-600 underline"
                  @click="openPopup(slotProps.data.attendanceMap.get(date))">
                  {{ slotProps.data.attendanceMap.get(date)?.codeName }}
                </span>
                <span v-else>—</span>
              </div>
            </div>
            <div class="flex flex-1 items-center ">
              <div>
                <!-- VM Details label/link -->
                <span v-if="slotProps.data.attendanceMap?.get(date)?.codeName"
                  class="cursor-pointer text-indigo-600 underline ml-2"
                  @click="showVmDetails(slotProps.data.studentId, date)">
                  VM Details
                </span>
              </div>
            </div>
          </template>
        </Column>


      </DataTable>



      <!-- overlay blur when loading -->
      <div
        v-if="loadingMap['attendanceCheck'] || loadingMap['fetchAttendanceByDatesDay'] || loadingMap['fetchAttendanceByDatesWeek']"
        class="rounded-2xl backdrop-blur-xs overlay" />
    </div>


    <Dialog v-model:visible="popupVisible" header="Details" :modal="true"
      :style="{ width: '50vw', maxHeight: '80vh', borderRadius: '0.5rem', backgroundColor: '#ffffff', color: '#374151' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }" class="custom-dialog">

       <!-- Conditional Summary Labels -->
        <ul
          v-if="popupSource === 'attendanceStatus'
          && popupData?.enrolledClasses
          && popupData.enrolledClasses.length > 0"
          class="mb-2 list-disc pl-5 text-red-600 font-medium">
          <!-- Case: courses is null or empty -->
          <li v-if="!popupData?.courses || popupData.courses.length === 0">
            The student’s enrollment class(es) does not belong to an active course.
          </li>

          <!-- Case: homeroom disabled -->
          <li v-else-if="!(popupData.courses as { homeRoom: boolean; attendance: boolean }[]).some(c => c.homeRoom)">
          The student’s enrollment class(es) belongs to a course with homeroom disabled.
          </li>

          <!-- Case: attendance disabled -->
          <li v-if="popupData?.courses && !(popupData.courses as { homeRoom: boolean; attendance: boolean }[]).some(c => c.attendance)">
             The student’s enrollment class(es) belongs to a course with attendance disabled.
          </li>

          <!-- Case: not active for current term -->
          <li v-if="!isClassActiveForCurrentTerm">
            The student’s enrollment class(es) is not active for the current term.
          </li>
        </ul>

        <!-- Show only "not enrolled" message if enrolledClasses is empty or null -->
        <div v-else class="mb-2 font-medium text-red-600">
          <ul v-if="popupSource === 'attendanceStatus'" class="list-disc pl-5">
            <li>The student is not enrolled to a class for the current term</li>
            <li>The student’s enrollment class(es) is not active for the current year</li>
          </ul>
        </div>

      <!-- JSON Display -->
      <JsonDisplay :value="popupData" />

      <!-- Footer with Close Button -->
      <template #footer>
        <Button label="Close" icon="pi pi-times" class="p-button-text" @click="popupVisible = false" />
      </template>
    </Dialog>


  </div>
</LayoutNormalCenter>
</template>

<style scoped>
/* TailwindCSS in use */
.custom-dialog .p-dialog-content {
  overflow: auto;
  max-height: 60vh;
  /* adjust as needed so footer isn't overlapped */
  padding: 1.5rem;
  font-size: 0.875rem;
  /* text-sm */
  white-space: pre-wrap;
  color: #374151;
}

.custom-dialog .p-dialog-header {
  font-size: 1.125rem;
  /* text-lg */
  font-weight: 600;
  color: #111827;
	}
</style>
