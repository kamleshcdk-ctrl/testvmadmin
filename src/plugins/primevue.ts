import PrimeVue from 'primevue/config';
import AnimateOnScroll from 'primevue/animateonscroll';
import ConfirmationService from 'primevue/confirmationservice';
import StyleClass from 'primevue/styleclass';
import ToastService from 'primevue/toastservice';
import Aura from '@primeuix/themes/aura';
import Tooltip from 'primevue/tooltip';

import Button from '@/volt/Button.vue';
import InputText from '@/volt/InputText.vue';
import Message from '@/volt/Message.vue';
import Toast from '@/volt/Toast.vue';
import Textarea from '@/volt/Textarea.vue'
import Select from '@/volt/Select.vue'
import ToggleSwitch from '@/volt/ToggleSwitch.vue'
import DataTable from '@/volt/DataTable.vue'
import Tag from '@/volt/Tag.vue'
import ConfirmDialog from '@/volt/ConfirmDialog.vue'
import Dialog from '@/volt/Dialog.vue';
import DatePicker from '@/volt/DatePicker.vue';
import SecondaryButton from '~/volt/SecondaryButton.vue';
import Listbox from '~/volt/Listbox.vue'
import Panel from '~/volt/Panel.vue'




export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    // unstyled: true,
    theme: {
      preset: Aura,
      options: {
        cssLayer: {
          name: 'primevue',
          order: 'theme, base, primevue'
        }
      }
    }
  });

  // Optional features

  nuxtApp.vueApp.directive('styleclass', StyleClass);
  nuxtApp.vueApp.directive('animateonscroll', AnimateOnScroll);
  nuxtApp.vueApp.directive('tooltip', Tooltip);
  nuxtApp.vueApp.use(ToastService);
  nuxtApp.vueApp.use(ConfirmationService);

  // Before adding a primevue volt Button component, run:
  //   npx volt-vue add Button
  nuxtApp.vueApp
    .component('Button', Button)
    .component('InputText', InputText)
    .component('Message', Message)
    .component('Toast', Toast)
    .component('Textarea', Textarea)
    .component('Select', Select)
    .component('ToggleSwitch', ToggleSwitch)
    .component('DataTable', DataTable)
    .component('Tag', Tag)
    .component('ConfirmDialog', ConfirmDialog)
    .component('Dialog', Dialog)
    .component('DatePicker', DatePicker)
    .component('SecondaryButton', SecondaryButton)
    .component('Listbox', Listbox)
    .component('Panel', Panel)

});
