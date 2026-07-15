import { createApp } from 'vue'
import App from './App.vue';

import Button from '@arco-design/web-vue/es/button';
import Dropdown from '@arco-design/web-vue/es/dropdown';
import Grid from '@arco-design/web-vue/es/grid';
import Progress from '@arco-design/web-vue/es/progress';
import Space from '@arco-design/web-vue/es/space';
import IconArrowDown from '@arco-design/web-vue/es/icon/icon-arrow-down';
import IconArrowUp from '@arco-design/web-vue/es/icon/icon-arrow-up';
import IconCheck from '@arco-design/web-vue/es/icon/icon-check';
import IconDownCircle from '@arco-design/web-vue/es/icon/icon-down-circle';
import IconLanguage from '@arco-design/web-vue/es/icon/icon-language';
import IconMoonFill from '@arco-design/web-vue/es/icon/icon-moon-fill';
import IconSunFill from '@arco-design/web-vue/es/icon/icon-sun-fill';
import IconUpCircle from '@arco-design/web-vue/es/icon/icon-up-circle';
import i18n from "@/locales";

import '@arco-design/web-vue/es/button/style/css.js';
import '@arco-design/web-vue/es/dropdown/style/css.js';
import '@arco-design/web-vue/es/grid/style/css.js';
import '@arco-design/web-vue/es/message/style/css.js';
import '@arco-design/web-vue/es/progress/style/css.js';
import '@arco-design/web-vue/es/space/style/css.js';

const app = createApp(App);
const arcoComponents = [
  Button,
  Dropdown,
  Grid,
  Progress,
  Space,
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconDownCircle,
  IconLanguage,
  IconMoonFill,
  IconSunFill,
  IconUpCircle
]

app.use(i18n)
arcoComponents.forEach((component) => app.use(component))
app.mount('#app');
