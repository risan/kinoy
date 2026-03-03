import type { App, Plugin } from 'vue';

import KInput from './components/KInput.vue';
import KInputMask from './components/KInputMask.vue';
import KInputPhone from './components/KInputPhone.vue';
import KInputZip from './components/KInputZip.vue';
import KInputNumber from './components/KInputNumber.vue';
import KInputCurrency from './components/KInputCurrency.vue';
import KInputFile from './components/KInputFile.vue';
import KInputAutocomplete from './components/KInputAutocomplete.vue';
import KInputPlace from './components/KInputPlace.vue';
import KSelect from './components/KSelect.vue';
import KDatepicker from './components/KDatepicker.vue';
import KButton from './components/KButton.vue';
import KBadge from './components/KBadge.vue';
import KAlert from './components/KAlert.vue';
import KLoading from './components/KLoading.vue';

export const KinoyPlugin: Plugin = {
  install(app: App) {
    app.component('KInput', KInput);
    app.component('KInputMask', KInputMask);
    app.component('KInputPhone', KInputPhone);
    app.component('KInputZip', KInputZip);
    app.component('KInputNumber', KInputNumber);
    app.component('KInputCurrency', KInputCurrency);
    app.component('KInputFile', KInputFile);
    app.component('KInputAutocomplete', KInputAutocomplete);
    app.component('KInputPlace', KInputPlace);
    app.component('KSelect', KSelect);
    app.component('KDatepicker', KDatepicker);
    app.component('KButton', KButton);
    app.component('KBadge', KBadge);
    app.component('KAlert', KAlert);
    app.component('KLoading', KLoading);
  },
};
