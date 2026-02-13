
<script setup lang="ts">
import toLocalDateTime from "@/filters/localdatetime";
import type { IRowNode } from "ag-grid-enterprise";


const emit = defineEmits(['clear-integration-cache'])

const { getAdminAllIntegrations } = useAdminAllIntegrationsQuery();
const { integrations } = getAdminAllIntegrations();
const gridOptions = {
  defaultColDef: {
    flex: 1,
    sortable: true,
    filter: true,
    resizable: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    enableRowGroup: true,
    floatingFilter: true,
  },
  sideBar: {
    defaultToolPanel: 'columns',
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
        },
      },
    ],
  },
  columnDefs: [
    {
      field: "id",
      hide: true,
    },
    {
      field: "enabled",
      cellDataType: 'checkbox',
      cellRenderer: 'agCheckboxCellRenderer',
      editable: false,
      hide: true,
      minWidth: 140,
      maxWidth: 140,
      flex: 1,
    },
    {
      field: "id",
      headerName: "Integration Role Cache",
      filter: "agTextColumnFilter",
      sortable: false,
      minWidth: 130,
      maxWidth: 130,

      cellRenderer: () => {
        return `<span class="hover:text-primary-500 hover:cursor-pointer">clear</span>`;
      },
      onCellClicked: async (row: IRowNode) => {
        if (row?.data?.id) {
          emit('clear-integration-cache', row?.data?.id)
        }
      },
    },
    {
      headerName: "Type",
      field: "slug",
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Location",
      field: "location.name",
      filter: "agTextColumnFilter",
    },
    {
      field: "error",
      filter: "agTextColumnFilter",
      cellClass: "underline text-blue-500",
      hide: true,
    },
    {
      headerName: "Created",
      field: "createdAt",
      // @ts-expect-error date format type
      valueFormatter: ({ value }) => toLocalDateTime(value),
    },
    {
      headerName: "Updated",
      field: "updatedAt",
      // @ts-expect-error date format type
      valueFormatter: ({ value }) => toLocalDateTime(value),
    },
    {
      field: "ranAt",
      // @ts-expect-error date format type
      valueFormatter: ({ value }) => toLocalDateTime(value),
      hide: true,
    }
  ],
};
</script>

<template>
<div class="min-h-screen overflow-auto">
  <div class="pl-6 pr-5 pt-2 font-bold text-xl">
    All Integrations
  </div>
  <DefaultAgGrid :row-data="integrations" :grid-options="gridOptions" />
</div>
</template>

<style scoped></style>
