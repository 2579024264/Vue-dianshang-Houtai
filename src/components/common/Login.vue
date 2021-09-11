<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="~assets/logo.png" alt="" />
      </div>
      <!-- 登录表单 -->
      <el-form
        label-width="0"
        class="login_form"
        :model="loginForm"
        :rules="rules"
        ref="loginFormRef"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-touxiang"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-suo"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      // 登录表单的验证规则对象
      rules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3, max: 5, message: '长度在3 到 5 个字符', trigger: 'blur',
          },
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          {
            min: 6, max: 10, message: '长度在6 到 10 个字符', trigger: 'blur',
          },
        ],
      },
    };
  },
  methods: {
    // 表单重置方法
    resetLoginForm() {
      console.log('重置')
      // 调用的是组件内容的方法resetFields
      this.$refs.loginFormRef.resetFields();
    },
    // 表单提交的预验证，该方法的参数是一个回调函数，
    // 回调函数的第一个参数是一个验证后返回的Boolean值
    login() {
      console.log('登录')
      this.$refs.loginFormRef.validate(async (valid) => {
        // 预验证失败
        if (!valid) {
          return;
        }
        // 这里的返回值是一个promise，所以使用await来简化这个过程
        // 使用解构的方式来得到返回的具体数据，并且重新命名为res
        const { data: res } = await this.$http.post('login', this.loginForm);
        if (res.meta.status !== 200) {
          return this.$message.error('登录失败');
        }
        this.$message.success('登录成功');
        // 登录成功返回的数据中存有token，这里保存token的数据
        window.sessionStorage.setItem('token', res.data.token);
        // 通过编程式导航的方法跳转到home路径下
        this.$router.push('/home');
      });
    },
  },
};
</script>

<style lang='less' scoped>
.login_container {
  background: #2b4b6b;
  height: 100%;

  .login_box {
    width: 450px;
    height: 300px;
    background: #fff;
    border-radius: 3px;

    position: absolute;
    left: 50%;
    top: 50%;

    transform: translate(-50%, -50%);

    .avatar_box {
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      //tanslate的移动的50%是相对于当前盒子的宽度和高度的
      transform: translate(-50%, -50%);
      background: #fff;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: #eee;
      }
    }
  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
  }
}
</style>
