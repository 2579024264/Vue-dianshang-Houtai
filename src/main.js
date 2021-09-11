import Vue from 'vue';
import App from './App.vue';
import './plugins/element.js';
// 导入全局样式表
import 'assets/css/global.css';
// 导入字体图标
import 'assets/font/iconfont.css';
import axios from 'axios';
import TreeTable from 'vue-table-with-tree-grid';
// 导入富文本编辑器对应的样式
import VueQuillEditor from 'vue-quill-editor';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';

// 导入NProgress 包对应的JS和Css
import NProgress from 'nprogress';
import store from './store';
import router from './router';
import 'nprogress/nprogress.css';
// 将该插件注册为全局组件
Vue.component('tree-table', TreeTable);
// 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor);
Vue.config.productionTip = false;
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
// 给axios设置请求拦截器

// 在request拦截器中，展示进度条
axios.interceptors.request.use((config) => {
  // 显示进度条
  NProgress.start();
  // 给请求头中添加一个Authorization属性，属性值是保存在sessiontStorage中的token值
  // 作用就是当下一次请求服务器时会将token携带过去
  config.headers.Authorization = window.sessionStorage.getItem('token');
  console.log(window.sessionStorage.getItem('token'));
  NProgress.done();
  return config;
});

// 在response拦截其中，隐藏进度条
axios.interceptors.response.use((config) => config);
Vue.prototype.$http = axios;
Vue.filter('dataFormat', (originaVal) => {
  const dt = new Date(originaVal);
  // 年
  const y = dt.getFullYear();
  // 月
  const m = (`${dt.getMonth() + 1}`).padStart(2, '0');
  // 日
  const d = (`${dt.getDate()}`).padStart(2, '0');
  // 时
  const hh = (`${dt.getHours()}`).padStart(2, '0');
  // 分
  const mm = (`${dt.getMinutes()}`).padStart(2, '0');
  // 秒
  const ss = (`${dt.getSeconds()}`).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
