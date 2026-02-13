<script setup lang="ts">
import moment from "moment";

const props =defineProps({
  value: {
    type: String,
    default: "America/New_York"
  }
})

const emit = defineEmits(['input'])

// vue-expect-error
function setValue(val :string) {
  emit("input", val);
};

const tzMap = ref( {
  Eastern: "America/New_York",
  Central: "America/Chicago",
  Mountain: "America/Denver",
  Pacific: "America/Los_Angeles",
  Hawaii: "Pacific/Honolulu",
  Atlantic: "America/Puerto_Rico",
  })

// const timezones = computed(() =>{
//   return moment.tz.names().filter((name) => {
//     return name.startsWith("America")
//   })
// });

const currentTime = computed(() => {
  if (props.value) {
    return moment().tz(props.value).format("h:mm a");
  }
  return null;
})
</script>


<template>

  <div>
    <label for="locationTimeZone">
      Time Zone
    </label>
    <!-- @vue-expect-error  -->
    <select id="locationTimeZone"
      :value="value" class="visitu w-full" @change="setValue($event.target?.value)">
      <option v-for="(key, val) in tzMap" :key="key" :value="key" >{{ val }} - {{key}}</option>
    </select>
    <div class="text-sm text-gray-700 mt-2">
      It is currently {{ currentTime }} {{ value }}
    </div>
  </div>
</template>

<style scoped></style>
