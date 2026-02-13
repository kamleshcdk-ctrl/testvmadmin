<script setup lang="ts">
import toLocalDateTime from "@/filters/localdatetime";

const { getTenants } = useTenantsQuery();
const { tenants } = getTenants();
const router = useRouter();

const gridOptions = {
  defaultColDef: {
    flex: 1,
    sortable: true,
    filter: true,
    resizable: true,
    enableRowGroup: true,
    floatingFilter: true,
  },
  // @ts-expect-error need ag-grid type
  onCellClicked: (s) => {
    router.push({
      path: `/tenants/${s.data.id}`,
    });
  },
  sideBar: {
    toolPanels: ["columns", "filters"],
  },
  columnDefs: [
    {
      field: "id",
    },
    {
      field: "name",
      filter: "agTextColumnFilter",
      cellClass: "underline text-blue-500",
    },
    {
      field: "expired",
      cellRenderer: "agCheckboxCellRenderer",
    },
    {
      field: "selfBilling",
      cellRenderer: "agCheckboxCellRenderer",
    },
    {
      field: "createdAt",
      // @ts-expect-error date format type
      valueFormatter: ({ value }) => toLocalDateTime(value),
    },
    {
      field: "expiresAt",
      // @ts-expect-error date format type
      valueFormatter: ({ value }) => toLocalDateTime(value),
      hide: true
    },
    {
      field: "stripeCustomerId",
      hide: true
    },
    {
      field: "stripeCustomerId",
      hide: true
    },
    {
      field: "domain",
      hide: true
    },
    {
      field: "studentCount",
      hide: true
    }
  ],
};
</script>

<template>
  <div class="h-[95vh]">
    <DefaultAgGrid :row-data="tenants" :grid-options="gridOptions" />
  </div>
</template>

<style scoped></style>
