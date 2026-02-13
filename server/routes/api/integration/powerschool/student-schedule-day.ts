import { Temporal } from '@js-temporal/polyfill';
import axios from "axios";
import type { PowerschoolDailyAttendance, PowerschoolScheduleDay, StudentScheduleDay } from "~/types";

export default eventHandler(async (event) => {
  try {
    const accessToken = await getCookieWithAccessToken(event)

    const postedParameters = await readBody(event)
    if (!postedParameters?.studentId) {
      throw new Error("studentId is required")
    }

    if (!postedParameters?.year || !postedParameters?.month || !postedParameters?.dayOfMonth) {
      throw new Error("Year, month and dayOfMonth are required");
    }

    const attendanceEnabled = postedParameters?.attendanceEnabled?.toString()?.toLowerCase() === "true" ? true : false;
    const fixedPlugin = postedParameters?.fixedPlugin?.toString()?.toLowerCase() === "true" ? true : false;
    const scheduleDate = Temporal.PlainDate.from(
      { year: postedParameters.year, month: postedParameters.month, day: postedParameters.dayOfMonth })
    const attendanceYearMonthDay = scheduleDate.toString()
    const attendanceMonthDayYear = `${scheduleDate.toPlainMonthDay()}-${scheduleDate.year}`


    let schoolNumber = Number(postedParameters.schoolNumber);
    let hasDailySchedule = false;
    let dailyScheduleInfo = {}
    let dailyScheduleCount = 0

    const idSwapData = {
      students_dcid: [postedParameters.studentId]
    }

    const idDcidSwapResult = await axios
      .post("/ws/schema/query/com.pearson.core.student.student_dcid_id_map", idSwapData, {
        baseURL: postedParameters.baseUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
    const swappedStudentId = idDcidSwapResult?.data?.record[0].id
    const swappedStudentDcId = idDcidSwapResult?.data?.record[0].dcid

    try {
      const postData = {
        studentid: swappedStudentId,
        att_date: attendanceYearMonthDay
      }

      const dailyScheduleResponse = await axios
        .post("/ws/schema/query/com.pearson.core.attendance.daily_attendance_template", postData, {
          baseURL: postedParameters.baseUrl,
          params: {
            page: 1,
            count: true,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

      dailyScheduleCount = dailyScheduleResponse?.data?.count ?? 0
      if (dailyScheduleCount > 0) {
        const dailySchedule = dailyScheduleResponse.data.record[0]?.tables?.attendance
        dailyScheduleInfo = {
          code: dailySchedule.attendance_codeid,
          day: dailySchedule.att_date,
          schoolId: dailySchedule.schoolid,
          yearId: dailySchedule.yearid,
          studentId: dailySchedule.studentid,
          comment: dailySchedule.comment,
        }
        schoolNumber = Number(dailySchedule.schoolid)
        hasDailySchedule = dailySchedule?.studentid ? true : false
      }
    } catch (err) {
      // eslint-disable-next-line
      console.log("Error getting daily schedule:", err)
    }

    let hasClassPeriods = false
    let meetingScheduleInfo = []
    try {
      const scheduleData = {
        "studentid": swappedStudentId,
        "schoolid": schoolNumber,
        "att_date": attendanceYearMonthDay
      }

      const meetingScheduleResponse = await axios
        .post("/ws/schema/query/com.pearson.core.attendance.meeting_interval_attendance_template", scheduleData, {
          baseURL: postedParameters.baseUrl,
          params: {
            page: 1,
            count: true,
          },
          headers: {
            Authorization: `Bearer ${accessToken} `,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

      // @ts-expect-error classMeeting
      meetingScheduleInfo = meetingScheduleResponse?.data?.record?.map(classMeeting => {
        return {
          comment: classMeeting.tables.attendance.att_comment,
          code: classMeeting.tables.attendance.attendance_codeid,
          day: classMeeting.tables.attendance.att_date,
          startTime: classMeeting.tables.attendance.start_time,
          endTime: classMeeting.tables.attendance.end_time,
          studentId: classMeeting.tables.attendance.studentid,
          periodId: classMeeting.tables.attendance.periodid
        }
      })
      hasClassPeriods = meetingScheduleInfo?.length >= 1;
    } catch (err) {
      // eslint-disable-next-line
      console.log("Error getting class period meeting schedule:", err)
    }

    const bridgePeriodData = {
      "studentId": swappedStudentId,
      "yearId": 34,
      "calendarDate": attendanceMonthDayYear,
    };

    const scheduleUrl = fixedPlugin ?
      "/ws/schema/query/com.visitu.project.student.studentschedulefordate" :
      "/ws/schema/query/com.visitu.project.student.dailyschedule"

    const bridgePeriodResponse = await axios
      .post(scheduleUrl, bridgePeriodData, {
        baseURL: postedParameters.baseUrl,
        params: {
          page: 1,
        },
        headers: {
          Authorization: `Bearer ${accessToken} `,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

    const potentialBridgePeriods = bridgePeriodResponse?.data?.record

    const bridgePeriods = []

    if (potentialBridgePeriods && potentialBridgePeriods.length > 0) {
      for (const potentialBridgePeriod of potentialBridgePeriods) {
        const foundBridgePeriod = potentialBridgePeriod['dailyattendperiod'] === '1';
        if (foundBridgePeriod) {
          bridgePeriods.push(potentialBridgePeriod)
        }
      }
    }

    const attendanceParams = {
      "attendance_att_mode_code": ["ATT_ModeMeeting", "ATT_ModeDaily"],
      "students_dcid": [swappedStudentDcId],
      "attendance_att_date_start": attendanceYearMonthDay,
      "attendance_att_date_end": attendanceYearMonthDay
    }

    let dailyAttendance: PowerschoolDailyAttendance = {}
    let hasDailyAttendance = false;
    const classMeetingAttendance = []

    try {
      if (attendanceEnabled) {
        const result = await axios
          .post("/ws/schema/query/com.pearson.core.attendance.student_attendance_detail",
            attendanceParams, {
            baseURL: postedParameters.baseUrl,
            params: {
              page: 1,
            },
            headers: {
              Authorization: `Bearer ${accessToken} `,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          })

        for (const attendanceInfoIndex in result?.data?.record) {
          const attendanceInfo = result?.data?.record[attendanceInfoIndex]
          if (attendanceInfo?.tables?.attendance?.att_mode_code === "ATT_ModeDaily") {
            dailyAttendance = attendanceInfo?.tables
            hasDailyAttendance = true
          }
          if (attendanceInfo?.tables?.attendance?.att_mode_code === "ATT_ModeMeeting") {
            classMeetingAttendance.push(attendanceInfo?.tables)
          }
        }
      }
    } catch (err) {
      // eslint-disable-next-line
      console.log("error getting attendance:", err)
    }


    const hasBridgePeriod = bridgePeriods.length >= 1;


    const powerschoolScheduleDay: PowerschoolScheduleDay = {
      hasBridgePeriod: hasBridgePeriod,
      bridgePeriodList: bridgePeriods,
      scheduleDay: dailyScheduleInfo,
      scheduleClassPeriods: meetingScheduleInfo,
      dailyAttendance: dailyAttendance,
      classMeetingAttendance: classMeetingAttendance
    }

    const dailyCode: string =
      powerschoolScheduleDay.dailyAttendance?.attendance_code?.att_code ?
        powerschoolScheduleDay.dailyAttendance?.attendance_code?.att_code : ""

    const studentScheduleDay: StudentScheduleDay = {
      studentId: postedParameters?.studentId,
      year: postedParameters?.year,
      month: postedParameters?.month,
      dayOfMonth: postedParameters?.dayOfMonth,
      schoolLocation: schoolNumber,
      found: hasClassPeriods || hasDailySchedule || hasBridgePeriod,
      hasClassPeriods: hasClassPeriods,
      hasDailySchedule: hasDailySchedule,
      numberOfClassPeriods: meetingScheduleInfo?.length || 0,
      rawPowerschool: powerschoolScheduleDay,
      swappedStudentId: swappedStudentId,
      swappedStudentDcId: swappedStudentDcId,

      hasDailyCode: hasDailyAttendance,
      dailyCode: dailyCode,
      hasClassPeriodCodes: powerschoolScheduleDay?.classMeetingAttendance?.length > 0,
    }
    return {
      success: true,
      count: dailyScheduleCount || 0,
      error: {},
      data: studentScheduleDay
    };
  } catch (err) {
    // eslint-disable-next-line
    console.log("error:", err)
    return {
      success: false,
      count: 0,
      error: err?.toString(),
      data: []
    };
  }
});
