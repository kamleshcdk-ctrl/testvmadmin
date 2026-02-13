<script setup>

import { useToast } from 'primevue/usetoast';

const toast = useToast();

const { mutate } = useMutation(gql`
  mutation CreateTenant($tenant: TenantInput!) {
    createTenant(tenant: $tenant) {
      id
    }
  }
`);

const router = useRouter();

async function createTenant(formData) {
  try{
    const resp = await mutate({
      tenant: {
        ...formData,
        staffCount: parseInt(formData.staffCount),
        studentCount: parseInt(formData.studentCount),
      },
    });

    const tenantId = resp.data.createTenant.id;

    toast.add({
        severity: 'success',
        summary: `Created tenant with id:'${tenantId}'.`,
        life: 4000
    });
    router.push("/tenants/" + tenantId);

  } catch {
    toast.add({ severity: 'error', summary: 'Update Failed',
      detail: 'The new district tenant was not created', life: 3000 });
  }
}

const { formTextStyles, formCheckboxStyles, formPrimarySubmitAttrs, formActionsAreaStyles }
  = useFormkitStyles()


</script>

<template>
  <LayoutNormalCenter
    page-name="Add District Tenant"
    page-description=
    "This form creates a school district tenant and a school location with the same name.">

        <FormKit type="form" :actions="true"
        submit-label="Add District Tenant"
        :config="{
              classes: { // puts the submit button on the right side
                actions: formActionsAreaStyles, // 'flex flex-1 flex-row-reverse'
              }
        }"
        :submit-attrs="formPrimarySubmitAttrs"
         @submit="createTenant">
          <FormKit label="District Tenant and First Location Name *" placeholder="School District Name"
            name="locationName" required type="text" :classes="formTextStyles"/>

          <FormKit label="Billing Email *" name="billingEmail" placeholder="example@email.com"
            validation="required|email" type="text" :classes="formTextStyles"/>

          <FormKit type="text" label="Address" placeholder="Address" name="address" :classes="formTextStyles"/>

          <FormKit label="Dashboard Subdomain *" name="domain" type="text" required validation="lowercase" placeholder="Subdomain"
            help="The dashboard subdomain is used as part of the url, https://<subdomain>.visitu.app" :classes="formTextStyles"/>

          <FormKit label="Sandbox" type="checkbox" :value="true" name="sandbox"
            help="Enable if this is a tesing sandbox rather than a real school." :classes="formCheckboxStyles"/>

          <div class="flex gap-4">
            <div class="flex-1">
              <FormKit type="text" label="Estimated Student Count" name="studentCount" placeholder="500" :classes="formTextStyles"/>
            </div>
            <div class="flex-1">
              <FormKit type="text" label="Estimated Staff Count" name="staffCount" placeholder="30" :classes="formTextStyles"/>
            </div>
          </div>

        </FormKit>
  </LayoutNormalCenter>
</template>
