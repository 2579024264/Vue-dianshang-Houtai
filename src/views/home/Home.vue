<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏  -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#333744" 
                 text-color="#fff" 
                 active-text-color="#409EFF"
                 unique-opened 
                :collapse="isCollapse" 
                :collapse-transition="false" 
                router 
                :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单的模板区 -->
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path + ''" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path + '')">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 放一个占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      // 左边菜单数据
      menuList: [],
      // 每一个一级菜单中i的类名
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-quanxian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-dingdan',
        145: 'iconfont icon-shujutongji',
      },
      // 是否折叠
      isCollapse: false,
      activePath: ' ',
    }
  },
  methods: {
    logout() {
      // 清空token
      window.sessionStorage.clear()
      // 跳转到登录页
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.message)
      this.menuList = res.data
    },
    // 点击切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存连接的激活状态 即保存点击二级菜单后的路径，然后将之在一级菜单中显示
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = window.sessionStorage.getItem('activePath')
    },
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
}
</script>

<style lang='less' scoped>
.home-container {
  width: 100%;
  height: 100%;
}
.el-header {
  background: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 25px;
}
.el-aside {
  background: #333744;

  .el-menu {
    border-right: none;
  }
}
.el-main {
  background: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background: #4a5964;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  color: #fff;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
