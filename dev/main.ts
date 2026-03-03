import { createApp } from 'vue';
import { KinoyPlugin } from '../src/plugin';
import App from './App.vue';
import './dev.css';

const app = createApp(App);
app.use(KinoyPlugin);
app.mount('#app');
