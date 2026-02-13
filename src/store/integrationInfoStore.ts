import { defineStore } from "pinia";
import type {
  IntegrationConfigProps,
  IntegrationLocation,
  IntegrationLocationResponse,
  IntegrationUser,
  IntegrationUserResponse,
  IntegrationUserScheduleResponse,
  PowerschoolPluginVersionResponse,
  StudentScheduleDay
} from "~/types";


interface IntegrationTenantLocations {
  domain: string;
  integrationType: string;
  locations: Map<string, IntegrationLocation>;
}

interface IntegrationTenantUsers {
  domain: string;
  integrationType: string;
  users: Map<string, IntegrationUser>;
}

interface IntegrationTenantStudentScheduleDays {
  domain: string;
  integrationType: string;
  studentScheduleDays: Map<string, StudentScheduleDay>;
}

export const integrationInfoStore = defineStore('integrationInfoStore', () => {

  // This store contains a list of school locations, a list of users and a list of
  // one day student schedules as represented in the external api such as powerschool.
  //
  // To handle storing multiple tenants, there is a list of the domain prefixes for
  // each domain used by the tenant. The list of locations, users and studentScheduleDays
  // for each tenant is stored under the domain of the tenant. This allows us to cache data
  // that we obtain from the external api as we switch back and forth between tenants.
  //
  // One tenant with one student information system is active at a time. The store
  // keeps track of the active tenant domain, and can use the active domain for the
  // tenant to get the list of locations, user, and studentScheduleDays for that tenant.

  // State:
  const activeTenantDomain = ref("")
  const activeIntegrationUrl = ref("")
  const activeIntegrationType = ref("")
  const activeIntegrationLocationId = ref<number>()
  const connected = ref(false)

  const loadingActions = ref<string[]>([])

  const fixedPowerschoolPlugin = ref(false)

  const tenantIntegrationLocations =
    ref<Map<string, IntegrationTenantLocations>>(new Map<string, IntegrationTenantLocations>())
  const activeTenantLocations = computed(() =>
    tenantIntegrationLocations.value.get(activeTenantDomain.value)?.locations)

  const tenantIntegrationUsers =
    ref<Map<string, IntegrationTenantUsers>>(new Map<string, IntegrationTenantUsers>())
  const activeTenantUsers = computed(() =>
    tenantIntegrationUsers.value.get(activeTenantDomain.value)?.users)

  const tenantIntegrationStudentScheduleDays =
    ref<Map<string, IntegrationTenantStudentScheduleDays>>(new Map<string, IntegrationTenantStudentScheduleDays>())
  const activeTenantStudentScheduleDays = computed(() =>
    tenantIntegrationStudentScheduleDays.value.get(activeTenantDomain.value)?.studentScheduleDays)

  // getters
  const loading = computed(() => loadingActions.value.length > 0)

  const getIntegrationUserById = computed(() => (id: string) => {
    return activeTenantUsers.value?.get(id)
  });

  const getStudentsInLocation = computed(() => (locationId: number) => {
    const userList = new Map<string, IntegrationUser>()
    activeTenantUsers.value?.forEach((user) => {
      if (user.userType === 'student' && user.locationId == locationId) {
        userList.set(user.id.toString(), user)
      }
    })
    return userList
  })

  const getStudentScheduleDay = computed(() => (studentId: string, year: number, month: number, dayOfMonth: number) => {
    return activeTenantStudentScheduleDays.value?.get(
      `${studentId}_${year}-${month}-${dayOfMonth}`)
  });

  // Actions:
  async function setup(jobParameters: IntegrationConfigProps) {
    activeIntegrationUrl.value = jobParameters.baseUrl
    activeTenantDomain.value = jobParameters.tenantDomain
    activeIntegrationType.value = jobParameters.integrationType

    if (!tenantIntegrationLocations.value.has(jobParameters.tenantDomain)) {
      // create tenant domain in list of locations
      tenantIntegrationLocations.value.set(jobParameters.tenantDomain, {
        domain: jobParameters.tenantDomain,
        integrationType: jobParameters.integrationType,
        locations: new Map<string, IntegrationLocation>()
      })
    }

    if (!tenantIntegrationUsers.value.has(jobParameters.tenantDomain)) {
      // create tenant domain in list of users
      tenantIntegrationUsers.value.set(jobParameters.tenantDomain, {
        domain: jobParameters.tenantDomain,
        integrationType: jobParameters.integrationType,
        users: new Map<string, IntegrationUser>()
      });
    }
    if (!tenantIntegrationStudentScheduleDays.value.has(jobParameters.tenantDomain)) {
      // create tenant domain in list of student schedule days
      tenantIntegrationStudentScheduleDays.value.set(jobParameters.tenantDomain, {
        domain: jobParameters.tenantDomain,
        integrationType: jobParameters.integrationType,
        studentScheduleDays: new Map<string, StudentScheduleDay>()
      })
    }
  }

  async function connect(jobParameters: IntegrationConfigProps) {
    await $fetch("/api/integration/powerschool/oauth", {
      method: 'POST',
      body: jobParameters,
    })

    connected.value = true
    await setup(jobParameters)
  }

  async function testPowerschoolPluginVersion() {
    const { data: taskResult, success } =
      await $fetch<PowerschoolPluginVersionResponse>("/api/integration/powerschool/try-fixed-plugin", {
        method: 'POST',
        body: { baseUrl: activeIntegrationUrl.value, tenantDomain: activeTenantDomain.value },
      })

    if (success && taskResult === true) {
      fixedPowerschoolPlugin.value = true;
    } else {
      fixedPowerschoolPlugin.value = false;
    }
  }

  async function loadLocations() {
    if (activeIntegrationType.value === 'powerschool') {
      return loadPowerschoolLocations()
    }
    throw new Error("unsupported integration type")
  }

  async function loadPowerschoolLocations() {
    loadingFor('loadPowerschoolLocations')

    const { data: taskResult, success } = await $fetch<IntegrationLocationResponse>("/api/integration/powerschool/locations", {
      method: 'POST', body: { baseUrl: activeIntegrationUrl.value, tenantDomain: activeTenantDomain.value },
    })
    connected.value = success

    if (success && taskResult) {
      const responseLocations = Array.from(taskResult)
      responseLocations.forEach((integrationLocation: IntegrationLocation) => {
        activeTenantLocations.value?.set(integrationLocation.id.toString(), {
          id: integrationLocation.id,
          schoolId: integrationLocation.schoolId,
          schoolNumber: integrationLocation.schoolNumber,
          name: integrationLocation.name,
          label: integrationLocation.name,
          location: integrationLocation,
        })
      })
    }

    // test powerschool plugin version
    await testPowerschoolPluginVersion()

    // done loading
    loadingFor('loadPowerschoolLocations', false)
    return activeTenantLocations.value
  }

  function loadingFor(actionName: string, loadingNow: boolean = true) {
    if (loadingNow) {
      loadingActions.value.push(actionName)
    } else {
      loadingActions.value.splice(
        loadingActions.value.indexOf(actionName), 1)
    }
  }

  async function loadPageOfStudents(schoolId: number, page: number = 1, limit: number = 0) {
    if (activeIntegrationType.value === 'powerschool') {
      return loadPageOfPowerschoolStudents(schoolId, page, limit)
    }
    throw new Error("unsupported integration type")
  }
  async function loadPageOfPowerschoolStudents(schoolId: number, page: number, limit: number = 0) {
    loadingFor('loadPageOfPowerschoolStudents')

    const { data: taskResult, success } = await $fetch<IntegrationUserResponse>("/api/integration/powerschool/students", {
      method: 'POST',
      body: {
        schoolId: schoolId, page: page,
        baseUrl: activeIntegrationUrl.value, tenantDomain: activeTenantDomain.value
      },
    })
    if (success && taskResult) {
      let resultUsers = Array.from(taskResult)
      if (limit > 0) {
        resultUsers = resultUsers.slice(0, limit);
      }
      resultUsers.forEach((integrationUser: IntegrationUser) => {
        activeTenantUsers.value?.set(`${integrationUser.id}`, {
          id: integrationUser.id,
          userType: integrationUser.userType,
          name: integrationUser.name,
          locationId: schoolId,
          raw: integrationUser.raw,
        })
      })
    }
    loadingFor('loadPageOfPowerschoolStudents', false)
  }

  async function countStudents(schoolId: number) {
    activeIntegrationLocationId.value = schoolId
    if (activeIntegrationType.value === 'powerschool') {
      return countPowerschoolStudents(schoolId)
    }
    throw new Error("unsupported integration type")
  }

  async function countPowerschoolStudents(schoolId: number) {
    loadingFor('countPowerschoolStudents')

    const { count, count: countSuccess } =
      await $fetch<IntegrationUserResponse>("/api/integration/powerschool/students/count", {
        method: 'POST',
        body: {
          baseUrl: activeIntegrationUrl.value, tenantDomain: activeTenantDomain.value, schoolId: schoolId
        },
      })

    loadingFor('countPowerschoolStudents', false)
    if (countSuccess) {
      return count
    }
    return 0;
  }

  async function loadStudents(schoolId: number) {
    activeIntegrationLocationId.value = schoolId
    if (activeIntegrationType.value === 'powerschool') {
      return loadPowerschoolStudents(schoolId)
    }
    throw new Error("unsupported integration type")
  }

  async function loadPowerschoolStudents(schoolId: number) {
    loadingFor('loadPowerschoolStudents')

    const { pages, count: countSuccess } =
      await $fetch<IntegrationUserResponse>("/api/integration/powerschool/students/count", {
        method: 'POST',
        body: {
          baseUrl: activeIntegrationUrl.value, tenantDomain: activeTenantDomain.value, schoolId: schoolId
        },
      })
    if (countSuccess) {
      if (pages) {
        for (let page = 1; page <= pages; page++) {
          loadPageOfPowerschoolStudents(schoolId, page);
        }
      } else { // TODO: This loading without pagination can be removed or used based on a parameter
        const { data: taskResult, success } = await $fetch<IntegrationUserResponse>("/api/integration/powerschool/students", {
          method: 'POST',
          body: {
            schoolId: schoolId,
            baseUrl: activeIntegrationUrl.value, tenantDomain: activeTenantDomain.value
          },
        })
        if (success && taskResult) {
          Array.from(taskResult).forEach((integrationUser: IntegrationUser) => {
            activeTenantUsers.value?.set(`${integrationUser.id}`, {
              id: integrationUser.id,
              userType: integrationUser.userType,
              name: integrationUser.name,
              locationId: schoolId,
              raw: integrationUser.raw,
            })
          })
        }
      }
    }
    loadingFor('loadPowerschoolStudents', false)
  }

  async function loadStudentScheduleDay(studentId: number, year: number, month: number, dayOfMonth: number, lookupAttendance: boolean = false, schoolNumber: number | null = null) {
    if (activeIntegrationType.value === 'powerschool') {
      return await loadPowerschoolStudentScheduleDay(studentId, year, month, dayOfMonth, lookupAttendance, schoolNumber)
    }
    throw new Error("unsupported integration type")
  }

  async function loadPowerschoolStudentScheduleDay(
    studentId: number,
    year: number, month: number, dayOfMonth: number,
    lookupAttendance: boolean,
    schoolNumber: number | null) {
    loadingFor('loadPowerschoolStudentScheduleDay')

    const { data: taskResult, success } =
      await $fetch<IntegrationUserScheduleResponse>("/api/integration/powerschool/student-schedule-day", {
        method: 'POST', body: {
          baseUrl: activeIntegrationUrl.value, tenantDomain: activeTenantDomain.value, studentId: studentId,
          year: year, month: month, dayOfMonth: dayOfMonth,
          schoolNumber: schoolNumber, fixedPlugin: fixedPowerschoolPlugin.value,
          attendanceEnabled: lookupAttendance
        },
      })

    if (success && taskResult) {
      activeTenantStudentScheduleDays.value?.set(`${taskResult.studentId}_${taskResult.year}-${taskResult.month}-${taskResult.dayOfMonth}`, taskResult)
    }
    loadingFor('loadPowerschoolStudentScheduleDay', false)
  }

  return {
    // state
    activeTenantDomain,
    activeIntegrationUrl,
    activeIntegrationType,
    connected,

    tenantIntegrationLocations,
    activeTenantLocations,

    tenantIntegrationUsers,
    activeTenantUsers,

    tenantIntegrationStudentScheduleDays,
    activeTenantStudentScheduleDays,
    fixedPowerschoolPlugin,

    // getters
    loading,
    getIntegrationUserById,
    getStudentScheduleDay,
    getStudentsInLocation,

    // actions
    setup,
    connect,
    loadLocations,
    countStudents,
    loadStudents,
    loadPageOfStudents,
    loadStudentScheduleDay,
  }
})
