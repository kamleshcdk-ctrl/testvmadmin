<template>
<div id="app-sidebar-floating"
  class="hidden lg:block flex-shrink-0 absolute lg:static left-0 top-0 z-10 select-none h-full lg:h-auto">
  <div class="h-full flex p-8 pr-0">
    <div>
      <div
        class="bg-surface-0 dark:bg-surface-900 rounded-xl shadow-md lg:border-0 border border-transparent dark:border-surface-700 w-[280px] flex flex-col h-full overflow-hidden">
        <div class="overflow-y-auto flex-1">
          <div class="p-4 flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <div v-styleclass="{
                selector: '@next',
                enterFromClass: 'hidden',
                enterActiveClass: 'animate-slidedown',
                leaveToClass: 'hidden',
                leaveActiveClass: 'animate-slideup'
              }"
                class="flex items-center cursor-pointer p-3 gap-4 rounded-md text-surface-900 dark:text-surface-0 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors duration-150 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700">
                <span class="font-semibold text-base leading-tight">
                  Home
                </span>
                <i class="pi pi-angle-down !text-base !leading-none text-surface-500 dark:text-surface-400 ml-auto" />
              </div>
              <ul class="list-none m-0 overflow-hidden flex flex-col gap-1 mt-1">
                <li>
                  <router-link to="/location-map"
                    active-class="bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-50"
                    class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 group border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 active:bg-pmkblue dark:active:bg-pmkblue">
                    <i
                      class="pi pi-map !text-base !leading-none text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                    <span class="font-medium text-base leading-tight">
                      Map of Schools
                    </span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/onboard-district-tenant"
                    active-class="bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-50"
                    class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 group border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 active:bg-pmkblue dark:active:bg-pmkblue">
                    <i
                      class="pi pi-plus-circle !text-base !leading-none text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                    <span class="font-medium text-base leading-tight">
                      Add District Tenant
                    </span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/tenants"
                    active-class="bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-50"
                    class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 group border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 active:bg-pmkblue dark:active:bg-pmkblue">
                    <i
                      class="pi pi-graduation-cap !text-base !leading-none text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                    <span class="font-medium text-base leading-tight">
                      District Tenants
                    </span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/locations"
                    active-class="bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-50"
                    class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 group border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 active:bg-pmkblue dark:active:bg-pmkblue">
                    <i
                      class="pi pi-building-columns !text-base !leading-none text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                    <span class="font-medium text-base leading-tight">
                      School Locations
                    </span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/users"
                    active-class="bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-50"
                    class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 group border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 active:bg-pmkblue dark:active:bg-pmkblue">
                    <i
                      class="pi pi-users !text-base !leading-none text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                    <span class="font-medium text-base leading-tight">
                      Search
                    </span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/tools"
                    active-class="bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-50"
                    class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 group border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 active:bg-pmkblue dark:active:bg-pmkblue">
                    <i
                      class="pi pi-wrench !text-base !leading-none text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                    <span class="font-medium text-base leading-tight">
                      System Tools
                    </span>
                  </router-link>
                </li>
              </ul>
            </div>

            <hr class="border-t border-surface-200 dark:border-surface-800 my-0" />

            <div class="flex flex-col gap-1">
              <div v-styleclass="{
                selector: '@next',
                enterFromClass: 'hidden',
                enterActiveClass: 'animate-slidedown',
                leaveToClass: 'hidden',
                leaveActiveClass: 'animate-slideup'
              }"
                class="flex items-center cursor-pointer p-3 gap-4 rounded-md text-surface-900 dark:text-surface-0 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors duration-150 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700">
                <span class="font-semibold text-base leading-tight">
                  SIS Integration Tools
                </span>
                <i class="pi pi-angle-down !text-base !leading-none text-surface-500 dark:text-surface-400 ml-auto" />
              </div>
              <ul class="list-none m-0 overflow-hidden flex flex-col gap-1 mt-1">
                <li>
                   <router-link to="/attendance-audit"
                    class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 group border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700">
                    <span
                      class="inline-flex items-center justify-center p-1 bg-amber-100 dark:bg-amber-500/20 rounded-md border border-violet-200 dark:border-violet-500/30">
                      <i class="pi pi-sparkles !text-xs !leading-none text-amber-600 dark:text-amber-300" />
                    </span>
                    <span class="font-medium text-base leading-tight">
                      Attendance
                    </span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/user-audit"
                    active-class="bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-50"
                    class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 group border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 active:bg-pmkblue dark:active:bg-pmkblue">

                    <span
                      class="inline-flex items-center justify-center p-1 bg-amber-100 dark:bg-amber-500/20 rounded-md border border-amber-200 dark:border-amber-500/30">
                      <i class="pi pi-wrench !text-xs !leading-none text-amber-600 dark:text-amber-300" />
                    </span>
                    <span class="font-medium text-base leading-tight">
                      User Audit
                    </span>
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="p-4 ml-11">
          <a class="flex items-center cursor-pointer gap-2 text-surface-900 dark:text-surface-0">
            <img src="~/assets/visitu.png" class="max-w-[125px] " />
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
</template>