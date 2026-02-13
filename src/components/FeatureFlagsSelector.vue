
<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
const confirm = useConfirm();

const props = defineProps({
  locationId: {
    type: String,
    required: true
  }
})

const toast = useToast();

const { getAllFeatureFlags } = useAllFeatureFlagsQuery()
const { onResult: onFeatureFlagResult } = getAllFeatureFlags()

const { getLocationById } = useLocationByIdQuery()
const { refetch: refetchLocation, onResult: onLocationResult } = getLocationById(props.locationId)

interface FeatureFlag {
  name: string;
  id: string;
}

const allFeatureFlags = ref<FeatureFlag[]>([]);
const selectedOtherFeatures = ref([])
const selectedConfigurationFeatures = ref<FeatureFlag[]>([]);
const selectedConfigurationCategories = ref([])

const flagsRarelyUsed = ref([
  "sso", "twitter", "facialRecognition", "google",
  "tipLine", "ticketing", "fences", "carline", "selfBilling",
  "broadcastTemplates" // Are broadcastTemplates rarely used?
])

const flagsOftenUsed = ref([
  "trackOffCampus", "labs", "markedMergedSyncUsers",
  "blackbaud", "clever", "progressbook", "facts", "veracross", "powerschool"
])
const integrationFlags = ref([
    "blackbaud","clever","progressbook","facts","veracross","powerschool",
]);
const configurationCategories = ref([
  {
    name: "Default Features", id: "default", flags:
      ["textMessages", "multiKiosk", "trackInChurnZero", "internalPmkSso", "healthCheckup"]
  },
  {
    name: "Visitor Management", id: "visitors", flags:
      ["vms", "preferredNameBadge", "watchList", "agreements", "offenderCheck", "coloredMobileQr"]
  },
  {
    name: "Attendance Push", id: "attendance", flags:
      ["attendance", "timeBasedReasons", "attendancePubSub"]
  },
  {
    name: "District", id: "district", flags:
      ["district", "createChildren"]
  },
  {
    name: "Broadcast Messaging", id: "broadcasts", flags:
      ["broadcasts"]
  },
  {
    name: "Emergency Alert", id: "emergency", flags:
      ["emergencyAlerts", "evacList"]
  }
]);

// The 'flagsUsedInAnyCategory' is the list of flag ids
// used in 'configurationCategories' above
const flagsUsedInAnyCategory = configurationCategories.value.map((category) => {
  return category.flags
})?.flat()

// When the configuration category selection changes, update the status for each
// of the feature flags in the selected or unselected category
const flagIdsForSelectedCategories = ref<string[]>([])
watch(selectedConfigurationCategories, async (newSelectedCategoryList, _) => {

  // Build a list of all the feature flag ids from the selected categories
  flagIdsForSelectedCategories.value = newSelectedCategoryList?.map((category) => {
    // @ts-expect-error category type
    return category.flags
  })?.flat()
  // console.log(`sum of selected category flags: ${flagIdsForSelectedCategories.value}`)

  // Build a list of the selected feature flag objects from the
  // currently selected feature flag ids in each selected configuration category
  selectedConfigurationFeatures.value = allFeatureFlags.value.filter((flag) => {
    return flagIdsForSelectedCategories.value.includes(flag.id) ? true : false
  })
})

const savedLocationFeatureFlags = ref<string[]>([]);
onLocationResult(async (result) => {
  if (!result.loading && result.data?.adminLocation) {

    savedLocationFeatureFlags.value = result.data?.adminLocation?.featureFlags
    // console.log("got location with feature flags:", result.data?.adminLocation?.featureFlags)

    selectedOtherFeatures.value = otherFeatures.value?.filter((flag) => {
      // @ts-expect-error need flag type
      return savedLocationFeatureFlags.value.includes(flag.id)
    })

    // @ts-expect-error selectedConfigurationCategories type
    selectedConfigurationCategories.value = configurationCategories.value.filter((flagCategory) => {
      for (const flag of flagCategory.flags) {
        if (savedLocationFeatureFlags.value.includes(flag)) {
          return true
        }
      }
      return false // none of the flags in the category are in the list of saved flags
    })

    configurationCategories.value.filter((flagCategory) => {
      let allFound = true

      const notFoundFlags: string[] = [];
      for (const flag of flagCategory.flags) {
        if (!savedLocationFeatureFlags.value.includes(flag)) {
          allFound = false;
          notFoundFlags.push(flag)
        }
      }
      if (!allFound) {
        if (notFoundFlags.length < flagCategory.flags.length) {
          notFoundFlags.forEach((flag) => {
            excludedFlags.value.push(flag)
          })
        }
        return true
      }
      return false // all the flags in this category are in the list of saved flags
    })
  }
})

const otherFeatures = ref([]);
onFeatureFlagResult((result) => {
  if (!result.loading && result.data?.featureFlags) {

    // allFeatureFlags is the full list available
    allFeatureFlags.value = result.data?.featureFlags?.map((flag: FeatureFlag) => {
      return { id: flag.id, name: flag.name }
    })

    // otherFeatures is the list excluding those shown in the configuration categories
    otherFeatures.value = result.data?.featureFlags?.filter((flag: FeatureFlag) => {
      return !flagsUsedInAnyCategory.includes(flag.id)
    }).map((flag: FeatureFlag) => {
      return { id: flag.id, name: flag.name }
    })

    refetchLocation()
  }
});

const excludedFlags = ref<string[]>([])

// supports crossing off and excluding a feature flag within a configuration category
function includeOrExclude(flag: string) {
  if (excludedFlags.value.includes(flag)) {
    // remove flag from excluded flags list
    excludedFlags.value = excludedFlags.value.filter((currentExcludedFlag) => {
      return !(currentExcludedFlag === flag);
    })
  } else {
    // add flag to excluded flags list
    excludedFlags.value.push(flag)
  }
}

function flagIsExcluded(flag: string) {
  return excludedFlags.value.includes(flag)
}

function flagIsRarelyUsed(flag: string) {
  return flagsRarelyUsed.value.includes(flag)
}

function flagIsOftenUsed(flag: string) {
  return flagsOftenUsed.value.includes(flag)
}

function flagIsSupported(flag: string) {
  return allFeatureFlags.value.map((currentFlag) => currentFlag.id).includes(flag)
}


function fullFlagInfo(flag: string) {
  const result = allFeatureFlags.value.filter((currentFlag) => currentFlag.id == flag)
  if (result.length > 0) {
    return result[0]
  }
  return { id: flag, name: '-' + flag + '-' }

}

// Build and sort the list of all selected flags from both selection lists
const allSelectedFeatureFlags = computed<FeatureFlag[]>(() => {

  const notExcludedConfigurationFlags = selectedConfigurationFeatures.value?.filter((flag) => {
    return !flagIsExcluded(flag.id)
  })

  if (notExcludedConfigurationFlags) {
    return notExcludedConfigurationFlags.concat(selectedOtherFeatures.value)
      .sort((a, b) => { return a?.name?.localeCompare(b?.name); }) as FeatureFlag[];
  }
  return [].concat(selectedOtherFeatures.value)
    .sort((a, b) => {
      // @ts-expect-error type of "a"
      return a?.name?.localeCompare(b?.name);
    }) as FeatureFlag[];
});

// Finally, update the saved values when the coombined list has changed
const { client } = useApolloClient();

async function saveSelectedFlags() {
  const allSelectedFeatureFlagIds = await allSelectedFeatureFlags.value.map((selectedFlag) => selectedFlag.id)

  try {
    await client.mutate({
      mutation: gql`
        mutation AdminUpdateLocationFlags(
          $locId: String!
          $input: AdminLocationInput!
        ) {
          adminUpdateLocation(id: $locId, input: $input) {
            id
          }
        }
      `,
      variables: {
        locId: props.locationId,
        input: {
          featureFlags: allSelectedFeatureFlagIds,
        },
      },
    });

    refetchLocation()

    toast.add({
      severity: 'info', summary: 'Confirmed',
      detail: 'You have successfully updated the feature flags', life: 3000
    });

  } catch {
    toast.add({
      severity: 'error', summary: 'Update Failed',
      detail: 'Your changes were not saved', life: 3000
    });
  }
}
async function saveSelectedFeatureFlags() {
    const allSelectedFeatureFlagIds = await allSelectedFeatureFlags.value.map(
        (selectedFlag) => selectedFlag.id,
    );

    // Check if more than one integration flag is selected
    const selectedIntegrationFlags = allSelectedFeatureFlagIds.filter(
        (flagId) => integrationFlags.value.includes(flagId),
    );

    if (selectedIntegrationFlags.length > 1) {
        // more than one Integration feature flag selected
        // toast.add({
        //   severity: 'error', summary: 'Update Failed',
        //   detail: `Only one integration flag can be selected. Currently selected: ${selectedIntegrationFlags.join(', ')}`, life: 5000
        // });

        confirm.require({
            message:
                "Please select only one integration at a time. For example, only 'PowerSchool', 'Facts', 'Blackbaud', 'Clever', 'Veracross', or 'ProgressBook'.",
            header: "Only one integration type flag should be selected at a time.",
            rejectProps: {
                label: "Cancel, Don't Save",
                class: "bg-primary!",
            },
            acceptProps: {
                label: "Save Anyway",
                class: "bg-surface-100! dark:bg-surface-700! border-surface-200! dark:border-surface-600! text-black! dark:text-black!",
            },
            accept: async () => {
                saveSelectedFlags();
                return;
            },
            reject: () => {
                return;
            },
        });
    } else {
        saveSelectedFlags();
    }
}
</script>


<template>
<div>
  <SectionDivider title="Configuration Categories and Feature Flags" />

  <div class="flex flex-wrap gap-4 justify-center p-4">

    <div class="flex flex-col gap-2 w-full sm:w-1/2 lg:w-1/3">
      <div class="card flex justify-center">
        <Listbox v-model="selectedConfigurationCategories" :options="configurationCategories" option-label="name"
          class="w-full text-primary-500 min-h-72" multiple checkmark :highlight-on-select="false">

          <template #header>
            <div class="flex justify-between p-4 border-b border-surface-300 dark:border-surface-600">
              Flag Configuration Categories
            </div>
          </template>

          <template #option="slotProps">
            <div>
              <div class="font-bold">{{ slotProps.option.name }}</div>
              <div v-for="flag in slotProps.option.flags" :key="flag" class="pl-5 pt-2 cursor-pointer"
                @click.stop="includeOrExclude(flag)">
                <span v-if="flagIsExcluded(flag)" class="line-through text-red-400">
                  {{ fullFlagInfo(flag)?.name }}
                </span>
                <span v-else>
                  {{ fullFlagInfo(flag)?.name }}
                </span>
              </div>
            </div>
          </template>
        </Listbox>
      </div>
    </div>

    <div class="flex flex-col gap-2 w-full sm:w-1/2 lg:w-1/3">
      <div class="card flex justify-center">
        <Listbox v-model="selectedOtherFeatures" :options="otherFeatures" filter option-label="name"
          class="w-full text-primary-500 min-h-72" multiple checkmark :highlight-on-select="false">

          <template #option="slotProps">
            <div v-if="flagIsRarelyUsed(slotProps.option.id)" class="text-surface-400">
              {{ slotProps.option.name }}
            </div>
            <div v-else-if="flagIsOftenUsed(slotProps.option.id)" class="font-bold">
              {{ slotProps.option.name }}
            </div>
            <div v-else>
              {{ slotProps.option.name }}
            </div>
          </template>
        </Listbox>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-2 items-center p-3 m-3">
    <Button class="min-w-48" @click="saveSelectedFeatureFlags">
      Save Feature Flags
    </Button>
  </div>

  <HideableSection title="Feature Flag Details" :hidden="true">
    <span v-for="chosenFlag in allSelectedFeatureFlags" :key="chosenFlag?.id">
      <Tag v-tooltip.bottom="{ value: chosenFlag?.id }" class="p-2 m-2" :value="`${chosenFlag?.name}`"
        severity="secondary" />
    </span>
    <span class="text-surface-700 dark:text-surface-100">
      Selected flags: {{ allSelectedFeatureFlags?.length }}
    </span>

    <SectionDivider title="Saved Flags" />

    <span v-for="savedFlagId in savedLocationFeatureFlags" :key="savedFlagId">
      <Tag class="p-2 m-2" :value="savedFlagId" :severity="flagIsSupported(savedFlagId) ? 'secondary' : 'primary'" />
    </span>
    <span class="text-surface-700 dark:text-surface-100">
      Saved flags: {{ savedLocationFeatureFlags?.length }}
    </span>
  </HideableSection>
</div>
</template>
