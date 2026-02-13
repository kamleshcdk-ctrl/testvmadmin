<script setup>
import empty from "@/components/agGrid/empty.vue";
import loading from "@/components/agGrid/loading.vue";
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import { AgGridVue } from "ag-grid-vue3";
import { LicenseManager } from "ag-grid-enterprise";
LicenseManager.setLicenseKey(
  "Using_this_AG_Grid_Enterprise_key_( AG-040952 )_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_( legal@ag-grid.com )___For_help_with_changing_this_key_please_contact_( info@ag-grid.com )___( Visitu LLC )_is_granted_a_( Single Application )_Developer_License_for_the_application_( Visitu LLC )_only_for_( 1 )_Front-End_JavaScript_developer___All_Front-End_JavaScript_developers_working_on_( Visitu LLC )_need_to_be_licensed___( Visitu LLC )_has_not_been_granted_a_Deployment_License_Add-on___This_key_works_with_AG_Grid_Enterprise_versions_released_before_( 12 April 2024 )____[v2]_MTcxMjg3NjQwMDAwMA==2b28330bd2896ef069686b8fd39ede00"
);

const noRowsOverlayComponent = empty;
const loadingOverlayComponent = loading;
</script>

<template>
<AgGridVue class="ag-theme-quartz ag-theme-visitu pl-5 pr-5 pt-2" dom-layout='autoHeight'
  :loading-overlay-component="loadingOverlayComponent" :no-rows-overlay-component="noRowsOverlayComponent" />
</template>

<style lang="css">
/*  Full list of configurable ag-grid styles:
    https://www.ag-grid.com/javascript-data-grid/global-style-customisation-variables/
*/

/* change the font style of the grid headers */
.ag-theme-quartz .ag-header-cell-label {
  font-weight: bold;
}

/* Dark mode overrides for AG Grid quartz theme */
.dark .ag-theme-quartz {
  --ag-background-color: #121212;
  --ag-odd-row-background-color: #1E1E1E;
  --ag-header-background-color: #1F1F1F;
  --ag-font-color: #D3D3D3; /* Light gray row text */
  --ag-header-foreground-color: #CCCCCC;
  --ag-border-color: #333333;
  --ag-row-hover-color: #2A2A2A;
  --ag-selection-background-color: #3A3A3A;
  --ag-focus-outline-color: #8888FF;
}

/* Apply custom properties to AG Grid elements */
.dark .ag-theme-quartz {
  background-color: var(--ag-background-color) !important;
  color: var(--ag-font-color) !important;
}

.dark .ag-theme-quartz .ag-cell {
  color: var(--ag-font-color) !important; 
}

.dark .ag-theme-quartz .ag-header {
  background-color: var(--ag-header-background-color);
  color: var(--ag-header-foreground-color);
  border-bottom: 1px solid var(--ag-border-color);
}

.dark .ag-theme-quartz .ag-row:nth-child(odd) {
  background-color: var(--ag-odd-row-background-color);
}

.dark .ag-theme-quartz .ag-row:hover {
  background-color: var(--ag-row-hover-color) !important;
}

.dark .ag-theme-quartz .ag-row-selected {
  background-color: var(--ag-selection-background-color) !important;
}

.dark .ag-overlay-no-rows-center,
.dark .ag-overlay-loading-center {
  color: var(--ag-font-color);
  background-color: var(--ag-background-color);
}
</style>
