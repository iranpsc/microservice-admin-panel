import { createApp } from 'vue';
import Root from './components/Root.vue';
import router from './router';
import axios from 'axios';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'select2/dist/css/select2.min.css';
import 'simple-line-icons/css/simple-line-icons.css';

// Set up axios defaults for Laravel
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

const app = createApp(Root);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '[data-theme="dark"]',
            cssLayer: false
        }
    }
});
app.mount('#app');
