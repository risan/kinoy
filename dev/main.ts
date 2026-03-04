import { createApp } from 'vue';
import { JbwUiPlugin } from '../src/plugin';
import App from './App.vue';
import './dev.css';

const app = createApp(App);
app.use(JbwUiPlugin);
app.mount('#app');
