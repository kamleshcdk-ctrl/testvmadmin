<script lang="ts" setup>
import ScheduleDay from './ScheduleDay.vue';
import type { StudentScheduleDay, PowerschoolClassMeetingAttendance } from "~/types";

defineProps({
  studentId: {
    type: String,
    default: ""
  },
  scheduleDay: {
    type: Object as PropType<StudentScheduleDay>,
    default: () => { }
  },
});

function dailyCode(scheduleDay: StudentScheduleDay): string {
  return scheduleDay?.dailyCode || ""
}

function classPeriodCodes(scheduleDay: StudentScheduleDay): string[] {
  return scheduleDay?.rawPowerschool?.classMeetingAttendance?.map(
    (item: PowerschoolClassMeetingAttendance) => {
      return item.attendance_code.att_code
    }) || []
}
</script>
<template>
  <div v-if="scheduleDay">
    <ScheduleDay :has-bridge="scheduleDay?.rawPowerschool?.hasBridgePeriod || false"
      :has-class-periods="scheduleDay?.hasClassPeriods" :has-daily="scheduleDay?.hasDailySchedule"
      :number-of-periods="scheduleDay?.numberOfClassPeriods" :has-daily-code="scheduleDay?.hasDailyCode"
      :has-class-period-codes="scheduleDay.hasClassPeriodCodes" :daily-code="dailyCode(scheduleDay)"
      :class-period-codes="classPeriodCodes(scheduleDay)" />
  </div>
</template>
