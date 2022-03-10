import { createApp } from 'vue';

import './styles/main.scss';
import App from './App.vue';

// Create Vue app
const app = createApp(App);
window.vue = app.mount('#app');
