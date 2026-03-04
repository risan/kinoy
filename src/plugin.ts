import type { App, Plugin } from 'vue';

import JInput from './components/JInput.vue';
import JInputMask from './components/JInputMask.vue';
import JInputPhone from './components/JInputPhone.vue';
import JInputZip from './components/JInputZip.vue';
import JInputNumber from './components/JInputNumber.vue';
import JInputCurrency from './components/JInputCurrency.vue';
import JInputFile from './components/JInputFile.vue';
import JInputAutocomplete from './components/JInputAutocomplete.vue';
import JInputPlace from './components/JInputPlace.vue';
import JSelect from './components/JSelect.vue';
import JDatepicker from './components/JDatepicker.vue';
import JButton from './components/JButton.vue';
import JBadge from './components/JBadge.vue';
import JAlert from './components/JAlert.vue';
import JLoading from './components/JLoading.vue';

export const JbwUiPlugin: Plugin = {
  install(app: App) {
    app.component('JInput', JInput);
    app.component('JInputMask', JInputMask);
    app.component('JInputPhone', JInputPhone);
    app.component('JInputZip', JInputZip);
    app.component('JInputNumber', JInputNumber);
    app.component('JInputCurrency', JInputCurrency);
    app.component('JInputFile', JInputFile);
    app.component('JInputAutocomplete', JInputAutocomplete);
    app.component('JInputPlace', JInputPlace);
    app.component('JSelect', JSelect);
    app.component('JDatepicker', JDatepicker);
    app.component('JButton', JButton);
    app.component('JBadge', JBadge);
    app.component('JAlert', JAlert);
    app.component('JLoading', JLoading);
  },
};
