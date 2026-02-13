<script lang="ts" setup>

const props = defineProps({
  hasDaily: {
    type: Boolean,
    default: false
  },
  hasBridge: {
    type: Boolean,
    default: false
  },
  hasClassPeriods: {
    type: Boolean,
    default: false
  },
  numberOfPeriods: {
    type: Number,
    default: 10,
  },

  hasDailyCode: {
    type: Boolean,
    default: false
  },
  dailyCode: {
    type: String,
    default: ""
  },
  hasClassPeriodCodes: {
    type: Boolean,
    default: false
  },
  classPeriods: {
    type: Array as PropType<number[]>,
    default: () => []
  },
  classPeriodCodes: {
    type: Array as PropType<string[]>,
    default: () => []
  },
});

const emptyStyleClasses = ["min-h-4", "min-w-20", "max-w-32", "bg-slate-500"]

const staticStyleClasses = [...emptyStyleClasses,
  "border-2", "border-black", "grid", "grid-flow-row", "gap-1"]
const staticStyleClassesNoBorder = [...emptyStyleClasses,
  "grid", "grid-flow-row", "gap-1"]
const containerStyles = ref(staticStyleClasses.join(" "))
const containerStylesNoBorder = ref(staticStyleClassesNoBorder.join(" "))

const periods = computed<number>(() => {
  if (!props.numberOfPeriods || props.numberOfPeriods === 0) {
    return 1
  }
  if (props.numberOfPeriods > 10) {
    return 10
  }
  return props.numberOfPeriods
})

watch(periods, (newNumberOfPeriods) => {
  columnGridStyle.value = `grid-template-columns: repeat(${newNumberOfPeriods}, minmax(0, 1fr))`
})

const classPeriodStyles = "border-2 border-gray-300"
const bridgePeriodStyles = "border-2 border-orange-300 bg-orange-300"
function stylesForPeriod(periodNumber: number): string {
  if (periodNumber === 1 && props.hasBridge) {
    return bridgePeriodStyles
  }
  return classPeriodStyles
}

const columnGridStyle = ref(`grid-template-columns: repeat(${props.numberOfPeriods}, minmax(0, 1fr))`)


// TODO: cleanup the selection of styles in this component
</script>

<template>
  <div>
    <div v-if="hasClassPeriods && hasDaily">
      <div :class="containerStyles" :style="columnGridStyle">
        <div v-for="period in periods" :key="period" :class="stylesForPeriod(period)">
        </div>
      </div>
    </div>
    <div v-else-if="hasClassPeriods && !hasDaily">
      <div :class="containerStylesNoBorder" :style="columnGridStyle">
        <div v-for="period in periods" :key="period" :class="stylesForPeriod(period)">
        </div>
      </div>
    </div>
    <div v-else-if="hasDaily && !hasClassPeriods && hasBridge" :class="staticStyleClasses">
      <div :class="bridgePeriodStyles"></div>
    </div>
    <div v-else-if="!hasDaily && !hasClassPeriods && hasBridge" :class="containerStylesNoBorder">
      <div :class="bridgePeriodStyles"></div>
    </div>
    <div v-else-if="hasDaily && !hasClassPeriods" :class="staticStyleClasses">
    </div>
    <div v-else :class="emptyStyleClasses"></div>
  </div>
  <div v-if="props.hasDailyCode || hasClassPeriodCodes" class="text-xs">
    <span v-if="props.hasDailyCode"> Day: {{ props.dailyCode }}</span>
    <span v-if="props.hasClassPeriodCodes">
      Period: <span v-for="(classPeriodCode, index) in classPeriodCodes" :key="index">
        {{ classPeriodCode }}
      </span>
    </span>


  </div>
</template>
