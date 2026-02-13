
<script setup lang="ts">
import toLocalDate from "@/filters/localdate";
import type { IRowNode } from "ag-grid-enterprise";
import { useVisituUsersStore } from '@/store/visituUsers'

const userStore = useVisituUsersStore()

const props = defineProps({
  usersWithRoleNames: {
    type: Array,
    required: true,
  },
  isDuplicatesTab: {
    type: Boolean,
    default: false,
  },
  tenantId: {
    type: String,
    required: true,
  },
  loadedUserCount: {
    type: Number,
    default: 0,
  },
  duplicateUserCount: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const gridApi = shallowRef();
const columnApi = shallowRef();
const gridIsReady = ref(false)
// @ts-expect-error need types
const onGridReady = (params) => {
  // eslint-disable-next-line
  console.log('Grid is ready :', props.isDuplicatesTab ? 'Duplicates Tab' : 'Users Tab')
  gridApi.value = params.api;
  columnApi.value = params.columnApi;

  usersShownInGrid.value = gridApi.value?.getDisplayedRowCount()

  gridIsReady.value = true
  restoreGridIfNeeded()
};

const rowDataUpdated = () => {
  usersShownInGrid.value = gridApi.value?.getDisplayedRowCount()
}
const onFilterChanged = () => {
  usersShownInGrid.value = gridApi.value?.getDisplayedRowCount()
  saveGrid()
}
const onGridColumnsChanged = () => {
  saveGrid()
}
const onSortChanged = () => {
  saveGrid()
}

const usersShownInGrid = ref(0)

// @ts-expect-error the date needs a type
function birthdateFormatter(params) {
  return toLocalDate(params.value);
}

const gridOptions = {
  loading: true,
  enableCellTextSelection: true,
  rowGroupPanelShow: 'always',
  defaultColDef: {
    flex: 1,
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    enableRowGroup: true,
    menuTabs: ['generalMenuTab'],
  },
  // sideBar: {
  //   toolPanels: ["columns", "filters"],
  // },
  sideBar: {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Hide or Show Additional Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressPivots: true,
          suppressPivotMode: true,
          suppressValues: true,
          suppressRowGroups: true,
        }
      },
      // {
      //   id: 'filters',
      //   labelDefault: 'Advanced Filters',
      //   labelKey: 'filters',
      //   iconKey: 'filter',
      //   toolPanel: 'agFiltersToolPanel',
      // }
    ]
  },
  columnDefs: [{
    field: "id",
    hide: true,
    cellClass: "text-blue-500",
    minWidth: 80,
    flex: 1,
  }, {
    headerName: ">",
    field: "id",
    sortable: false,
    filter: false,
    hide: props.isDuplicatesTab,
    minWidth: 60,
    maxWidth: 60,
    cellRenderer: () => {
      return `<i
        class="pi pi-users !text-base !leading-none text-surface-500 dark:text-surface-400 hover:text-primary-700 dark:hover:text-primary-300" />
      `;
    },
    onCellClicked: async (row: IRowNode) => {
      await navigateTo({
        path: `/users/${row.data.id}`,
      }, {
        open: {
          target: '_blank',
        }
      })
    },
  }, {
    headerName: "Merge",
    field: "id",
    sortable: false,
    filter: false,
    hide: !props.isDuplicatesTab,
    minWidth: 90,
    maxWidth: 90,
    cellRenderer: () => {
      return `<i
        class="pi pi-delete-left !text-base !leading-none text-surface-500 dark:text-surface-400 hover:text-primary-700 dark:hover:text-primary-300" />
      `;
    },
    onCellClicked: async (row: IRowNode) => {
      await navigateTo({
        path: `/user-audit/${props.tenantId}/merge/${row.data.id}`,
      })
    },
  }, {
    field: "name",
    hide: props.isDuplicatesTab,
    sort: "asc",
    sortable: true,
    filter: "agTextColumnFilter",
  }, {
    headerName: "Only First and Last Name",
    field: "firstAndLastName",
    hide: !props.isDuplicatesTab,
    sortable: true,
    filter: "agTextColumnFilter",
  }, {
    headerName: "Phone or Email",
    hide: true,
    field: "phoneOrEmail",

    minWidth: 120,
    maxWidth: 120,
    cellDataType: 'boolean',
    cellClass: "text-blue-500",
    editable: false,
    flex: 1,
  }, {
    field: "phone",
    hide: false,
    filter: "agTextColumnFilter",
  }, {
    field: "rawSyncPhoneNumbers",
    hide: !props.isDuplicatesTab,
  }, {
    field: "email",
    hide: false,
    filter: "agTextColumnFilter",
  }, {
    field: "rawSyncEmails",
    hide: !props.isDuplicatesTab,
  }, {
    field: "address",
    hide: true,
    filter: "agTextColumnFilter",
  }, {
    headerName: "Has Birth Date",
    field: "hasBirthDate",
    hide: props.isDuplicatesTab,
    cellDataType: 'boolean',
    editable: false,
    minWidth: 120,
    maxWidth: 120,
    flex: 1,
  },
  {
    headerName: "Date of Birth",
    field: "dateOfBirth",
    hide: true,

    minWidth: 120,
    maxWidth: 120,
    valueFormatter: birthdateFormatter
  }, {
    headerName: "Birthday (Unused)",
    field: "birthday",

    minWidth: 120,
    maxWidth: 120,
    hide: true,
    valueFormatter: birthdateFormatter
  }, {
    headerName: "Guardian Link",

    field: "hasParentOrChild",
    hide: props.isDuplicatesTab,
    cellDataType: 'boolean',
    editable: false,
    minWidth: 130,
    maxWidth: 130,
    flex: 1,
  }, {
    headerName: "Guardian Links",
    hide: true,
    field: "guardianLinkCount",
    filter: "agTextColumnFilter",

    minWidth: 130,
    maxWidth: 130,
  }, {
    headerName: "Has Merged User",

    field: "hasMergedUsers",
    hide: !props.isDuplicatesTab,
    cellDataType: 'boolean',
    editable: false,
    minWidth: 130,
    maxWidth: 130,
    flex: 1,
  }, {
    headerName: "Merged Count",
    hide: true,
    field: "mergedUserCount",
    filter: "agTextColumnFilter",

    minWidth: 130,
    maxWidth: 130,
  }, {
    headerName: "Mobile App",
    field: "hasMobileApp",
    hide: true,
    cellDataType: 'boolean',
    editable: false,

    minWidth: 100,
    maxWidth: 100,
    flex: 1,
  }, {
    headerName: "Roles",
    field: "roleNames",
    hide: false,
  }, {
    headerName: "Role Locations",
    field: "roleLocationNames",
    hide: true,
  }, {
    headerName: "Has Parent",
    field: "hasParent",
    hide: true,
    cellDataType: 'boolean',
    editable: false,
    minWidth: 100,
    maxWidth: 100,
    flex: 1,
  }, {
    headerName: "Has Child",
    field: "hasChild",
    hide: true,
    cellDataType: 'boolean',
    editable: false,
    minWidth: 100,
    maxWidth: 100,
    flex: 1,
  }, {
    headerName: "No Phone Email or Dob",
    field: "missingAll",
    hide: true,
    cellDataType: 'boolean',
    editable: false,
    minWidth: 100,
    maxWidth: 100,
    flex: 1,
  }, {
    field: "syncId",
    hide: true,
    filter: "agTextColumnFilter",
  }, {
    field: "syncHash",
    hide: true,
    filter: "agTextColumnFilter",
  }, {
    field: "syncNotes",
    hide: true,
    filter: "agTextColumnFilter",
  }, {
    field: "syncProvider",
    hide: true,
    filter: "agTextColumnFilter",
  }, {
    field: "syncedAt",
    hide: true,
  }, {
    field: "createdAt",
    hide: true,
  }],
};

function exportGrid() {
  const params = {
    fileName: 'users.csv',
    // @ts-expect-error params type
    processCellCallback: (params) => {
      if (params.value === true) return 'Yes';
      if (params.value === false) return 'No';
      return params.value;
    }
  };

  gridApi?.value.exportDataAsCsv(params);
}


async function saveGrid() {
  if (gridIsReady.value && userStore.autoSaveGridOptions && props.isDuplicatesTab) {

    // Get current state
    userStore.savedDuplicateGridState = await gridApi?.value.getState();

    const columnState = await gridApi?.value?.getColumnState();
    userStore.savedDuplicateColumnState = columnState;
  }

  if (gridIsReady.value && userStore.autoSaveGridOptions && !props.isDuplicatesTab) {

    // Get current state
    userStore.savedGridState = await gridApi?.value.getState();

    const columnState = await gridApi?.value?.getColumnState();
    userStore.savedColumnState = columnState;
  }
}

async function restoreGridIfNeeded() {
  if (props.isDuplicatesTab && userStore.autoSaveGridOptions) {
    // @ts-expect-error filter type
    if (userStore.savedDuplicateGridState?.filter) {
      // @ts-expect-error filter type
      gridApi?.value.setFilterModel(userStore.savedDuplicateGridState.filter.filterModel);
    }

    if (userStore.savedDuplicateColumnState) {
      gridApi?.value?.applyColumnState({
        state: userStore.savedDuplicateColumnState,
        applyOrder: true,
      });
    }
  }

  if (!props.isDuplicatesTab && userStore.autoSaveGridOptions) {
    // @ts-expect-error filter type
    if (userStore.savedGridState?.filter) {
      // @ts-expect-error filter type
      gridApi?.value.setFilterModel(userStore.savedGridState.filter.filterModel);
    }
    if (userStore.savedColumnState) {
      gridApi?.value?.applyColumnState({
        state: userStore.savedColumnState,
        applyOrder: true,
      });
    }
  }
}

function resetGrid() {
  gridApi?.value?.resetColumnState();
  gridApi?.value?.setFilterModel(null);
}

</script>

<template>
<div class="flex flex-1 items-center justify-between p-2">

  <div class="flex flex-col gap-2">
    <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
      Duplicate Names: {{ duplicateUserCount }}
    </div>
    <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
      Users Shown: {{ usersShownInGrid }}
    </div>
  </div>

  <div class="flex flex-col gap-2 items-center">
    <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
      Save Columns and Filters
    </div>
    <div>
      <ToggleSwitch id="autoSaveGridOptions" v-model="userStore.autoSaveGridOptions" />
    </div>
  </div>

  <div class="flex flex-col gap-2 items-center">
    <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
      <Button class="bg-surface-400 border-surface-200" @click="resetGrid()">
        Reset Columns and Filters
      </Button>
    </div>
  </div>

  <div class="flex flex-col gap-2 items-center">
    <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
      <Button class="bg-surface-400 border-surface-200" @click="exportGrid()">
        Export Csv File
      </Button>
    </div>
  </div>

</div>
<div class="overlaycontainer">
  <DefaultAgGrid :row-data="gridIsReady ? props.usersWithRoleNames : null" :grid-options="gridOptions"
    @grid-ready="onGridReady" @row-data-updated="rowDataUpdated" @filter-changed="onFilterChanged"
    @displayed-columns-changed="onGridColumnsChanged" @sort-changed="onSortChanged" />

  <!-- overlay blur when loading -->
  <div v-if="loading" class="rounded-2xl backdrop-blur-xs overlay" />
</div>
</template>

<style lang="css">
.ag-center-cols-viewport {
  min-height: 500px !important;}
</style>
