
<script setup lang="ts">
import toLocalDateTime from "@/filters/localdatetime";

const router = useRouter();

const { getLocations } = useLocationsQuery();
const { locations } = getLocations();

const gridOptions = {
  defaultColDef: {
    flex: 1,
    sortable: true,
    filter: true,
    resizable: true,
    enableRowGroup: true,
    floatingFilter: true,
  },
  sideBar: {
    toolPanels: ["columns", "filters"],
  },
  // @ts-expect-error need cell event type
  onCellClicked: (s) => {
    if (s.colDef.field === "name") {
      router.push({
        path: `/locations/${s.data.id}`,
      });
    } else if (s.colDef.field === "tenant.name") {
      router.push({
        path: `/tenants/${s.data.tenant.id}`,
      });
    } else if (s.colDef.field === "parent.name") {
      router.push({
        path: `/locations/${s.data.parent.id}`,
      });
    }
  },
  columnDefs: [
    {
      field: "id",
    },
    {
      field: "name",
      headerName: "School Name",
      filter: "agTextColumnFilter",
      cellClass: "underline text-blue-500",
    },
    {
      field: "parent.name",
      headerName: "Parent Name",
      filter: "agTextColumnFilter",
      cellClass: "underline text-blue-500",
    },
    {
      field: "tenant.name",
      cellClass: "underline text-blue-500",
    },
    {
      field: "tenant.id",
      hide: true,
    },
    {
      field: "pmkSchoolId",
      hide: false
    },
    {
      field: "address",
      hide: true,
    },
    {
      field: "ncesId",
      hide: true,
    },
    {
      field: "ncesDistrictId",
      hide: true,
    },
    {
      cellRenderer: "agCheckboxCellRenderer",
      field: "expired",
      hide: true,
    },
    {
      field: "tenant.sandbox",
      cellClass: "underline text-blue-500",
      cellRenderer: "agCheckboxCellRenderer",
    },
    {
      field: "tenant.expired",
      cellClass: "underline text-blue-500",
      cellRenderer: "agCheckboxCellRenderer",
    },
    {
      field: "featureFlags",
      hide: true,
    },
    {
      field: "createdAt",
      // @ts-expect-error date format type
      valueFormatter: ({ value }) => toLocalDateTime(value),
    },
    {
      field: "activeAt",
      // @ts-expect-error date format type
      valueFormatter: ({ value }) => toLocalDateTime(value),
      // @ts-expect-error need type for data
      valueGetter: ({ data }) => {
        if (data.parent) {
          return data.parent.activeAt;
        }
        return data.activeAt;
      },
    },
  ],
};
</script>

<template>
<div>
  <LayoutNormalCenter page-name="School Locations Details"
    page-description="Sort and filter locations. Show additional information such as the enabled feature flags. And export to csv if needed.">

    <DefaultAgGrid :row-data="locations" :grid-options="gridOptions" />
  </LayoutNormalCenter>
</div>
</template>

<style scoped></style>
