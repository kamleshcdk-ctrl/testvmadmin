import { integrationInfoStore } from './../../src/store/integrationInfoStore';

import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import type { IntegrationConfigProps } from '~/types';

// // The registerEndpoint utility is described here:
// https://developer.mamezou-tech.com/en/blogs/2024/02/12/nuxt3-unit-testing-mock/

describe("integrationInfoStore", () => {

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const connectionParameters: IntegrationConfigProps = {
    baseUrl: "http://partner4.powerschool.com",
    clientId: "",
    yearId: "34",
    clientSecret: "",
    tenantDomain: "example-domain",
    integrationType: "powerschool"
  }

  const mockLocationsResponse = {
    "success": true,
    "count": 1,
    "error": {},
    "data": [{
      "id": 3,
      "schoolId": 100,
      "name": "Apple Grove High School",
      "location": {
        "id": 3,
        "name": "Apple Grove High School",
        "school_number": 100,
        "low_grade": 9,
        "high_grade": 12,
        "alternate_school_number": 100,
        "addresses": {
          "physical": {
            "street": "4220 Richmond Cir",
            "city": "Jackson",
            "state_province": "MS",
            "postal_code": 39203
          }
        },
        "phones": {
          "main": {
            "number": "(555) 555-1200"
          }
        }
      }
    }]
  }

  const mockStudentPageResponse = {
    "success": true,
    "count": 2,
    "error": {},
    "data": [{
      "id": 2,
      "userType": "student",
      "name": "Brandon Adair",
      "raw": {}
    }, {
      "id": 3,
      "userType": "student",
      "name": "Corby Adams",
      "raw": {}
    }]
  }

  const studentScheduleDayResponse = {
    "success": true,
    "count": 2,
    "error": {},
    "data": {
      "studentId": 2,
      "year": 2024,
      "month": 11,
      "dayOfMonth": 12,
      "schoolLocation": 100,
      "found": true,
      "hasClassPeriods": true,
      "rawPowerschool": {
        "hasBridgePeriod": true,
        "bridgePeriodList": [
          {
            "periodid": "4296",
            "_name": "cc",
            "end_time": "36000",
            "periodnumber": "1",
            "sectionid": "8",
            "calendardate": "2024-11-12",
            "studentid": "9",
            "start_time": "30600",
            "ccid": "69330",
            "att_mode_code": "ATT_ModeMeeting",
            "schoolid": "100",
            "dailyattendperiod": "1"
          },
          {
            "periodid": "4296",
            "_name": "cc",
            "end_time": "36000",
            "periodnumber": "1",
            "sectionid": "146",
            "calendardate": "2024-11-12",
            "studentid": "9",
            "start_time": "30600",
            "ccid": "69304",
            "att_mode_code": "ATT_ModeMeeting",
            "schoolid": "100",
            "dailyattendperiod": "1"
          }
        ],
        "scheduleDay": {
          "code": null,
          "day": "2024-11-12",
          "schoolId": "100",
          "yearId": "34",
          "studentId": "2"
        },
        "scheduleClassPeriods": [
          {
            "comment": null,
            "code": null,
            "day": "2024-11-12",
            "startTime": "36000",
            "endTime": "36000",
            "studentId": "2",
            "periodId": "4296"
          },
          {
            "comment": null,
            "code": null,
            "day": "2024-11-12",
            "startTime": "41700",
            "endTime": "41700",
            "studentId": "2",
            "periodId": "4297"
          },
          {
            "comment": null,
            "code": null,
            "day": "2024-11-12",
            "startTime": "49500",
            "endTime": "49500",
            "studentId": "2",
            "periodId": "4298"
          },
          {
            "comment": null,
            "code": null,
            "day": "2024-11-12",
            "startTime": "55200",
            "endTime": "55200",
            "studentId": "2",
            "periodId": "4299"
          }
        ]
      }
    }
  }

  it('has the default values in the store when first created', async () => {
    const integrationInfo = integrationInfoStore()
    expect(integrationInfo.tenantIntegrationLocations.size).toBe(0)

    await integrationInfo.setup(connectionParameters)
    expect(integrationInfo.activeTenantDomain).toBe("example-domain")
    expect(integrationInfo.activeIntegrationUrl).toBe("http://partner4.powerschool.com")
    expect(integrationInfo.activeIntegrationType).toBe("powerschool")

  })

  it('has a location after running loadLocations', async () => {
    registerEndpoint('/api/integration/powerschool/locations', {
      method: 'POST',
      handler: () => (mockLocationsResponse)
    })

    registerEndpoint('/api/integration/powerschool/try-fixed-plugin', {
      method: 'POST',
      handler: () => ({
        "success": false,
        "data": false
      })
    })

    const integrationInfo = integrationInfoStore()
    await integrationInfo.setup(connectionParameters)
    await integrationInfo.loadLocations()

    expect(integrationInfo.tenantIntegrationLocations.size).toBe(1)
    expect(integrationInfo.tenantIntegrationLocations?.get("example-domain")?.domain).toBe("example-domain")
    expect(integrationInfo.activeTenantLocations?.get("3")?.name).toBe("Apple Grove High School")
    expect(integrationInfo.activeTenantLocations?.get("9999")).toBe(undefined)
  })

  it('has students after running loadPageOfStudents', async () => {
    registerEndpoint('/api/integration/powerschool/students', {
      method: 'POST',
      handler: () => (mockStudentPageResponse)
    })

    const integrationInfo = integrationInfoStore()
    await integrationInfo.setup(connectionParameters)
    await integrationInfo.loadPageOfStudents(3)

    expect(integrationInfo.activeTenantUsers?.get("2")?.name).toBe("Brandon Adair")
    expect(integrationInfo.activeTenantUsers?.get("3")?.name).toBe("Corby Adams")
  })

  it('has schedule for a student on a day after running loadStudentScheduleDay', async () => {
    registerEndpoint('/api/integration/powerschool/student-schedule-day', {
      method: 'POST',
      handler: () => (studentScheduleDayResponse)
    })

    const integrationInfo = integrationInfoStore()
    await integrationInfo.setup(connectionParameters)

    // The parameters in the loadStudentScheduleDay call here should match the hard coded response
    // because the student id and date returned by the response is what is used
    await integrationInfo.loadStudentScheduleDay(2, 2024, 11, 12)

    const studentDaySchedule = integrationInfo.activeTenantStudentScheduleDays?.get("2_2024-11-12")
    expect(studentDaySchedule?.studentId).toBe(2)
    expect(studentDaySchedule?.year).toBe(2024)
    expect(studentDaySchedule?.month).toBe(11)
    expect(studentDaySchedule?.dayOfMonth).toBe(12)
    expect(studentDaySchedule?.found).toBe(true)
    expect(studentDaySchedule?.hasClassPeriods).toBe(true)
  })

})
