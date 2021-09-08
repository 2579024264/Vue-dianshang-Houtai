import Vue from 'vue';
import VueRouter from 'vue-router';

const Login = () => import('components/common/Login.vue');
const Home = () => import('views/home/Home.vue');
const Welcome = () => import('components/content/Welcome.vue');
const Users = () => import('views/home/users/Users.vue');
const Rights = () => import('views/home/power/Rights.vue');
const Roles = () => import('views/home/power/Roles.vue');
const Cate = () => import('views/home/goods/Cate.vue');
const Params = () => import('views/home/goods/Params.vue');
const GoodList = () => import('views/home/goods/List.vue');
const Add = () => import('views/home/goods/Add.vue');
const Order = () => import('views/home/order/Order.vue');
const Report = () => import('views/home/report/Report.vue');
Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',

    children: [{
      path: '/welcome',
      component: Welcome,
    },
    {
      path: '/users',
      component: Users,
    },
    {
      path: '/rights',
      component: Rights,
    },
    {
      path: '/roles',
      component: Roles,
    },
    {
      path: '/categories',
      component: Cate,
    },
    {
      path: '/params',
      component: Params,
    },
    {
      path: '/goods',
      component: GoodList,
    },
    {
      path: '/goods/add',
      component: Add,
    },
    {
      path: '/orders',
      component: Order,
    },
    {
      path: '/reports',
      component: Report,
    },
    ],

  },

];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 从那个路径跳转过来的
  // next 是一个函数表示放行，next()放行  next('login')表示强制跳转
  if (to.path === '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) return next('/login');
  next();
});

export default router;
