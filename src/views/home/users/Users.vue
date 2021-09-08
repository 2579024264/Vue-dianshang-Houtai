<template>
<div>
<!-- 面包屑导航区 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户列表</el-breadcrumb-item>
</el-breadcrumb>
<!-- 卡片视图区 -->
  <el-card >
    <el-row :gutter="20">
      <el-col :span="10">
         <el-input placeholder="请输入内容"
                    v-model="queryInfo.query" clearable
                    @clear="getUserList">
         <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
         </el-input>
      </el-col>
      <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
      </el-col>
    </el-row>
    <!-- 用户列表区 -->
    <el-table :data="userlist" border stripe>
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column label="姓名" prop="username"></el-table-column>
      <el-table-column label="邮箱" prop="email"></el-table-column>
      <el-table-column label="电话" prop="mobile"></el-table-column>
      <el-table-column label="角色" prop="role_name"></el-table-column>
      <el-table-column label="状态">
        <!-- 使用作用于插槽在这里插入一个switch 下面的scope是整个行中的数据-->
        <template slot-scope="scope">
          <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
        </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <el-tooltip  effect="dark" content="编辑" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)"></el-button>
          </el-tooltip>
          <!-- 删除按钮 -->
          <el-tooltip  effect="dark" content="删除" placement="top" :enterable="false">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUserById(scope.row.id)"></el-button>
          </el-tooltip>
          <!-- 分配角色按钮 -->
          <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3,4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
  </el-card>
  <!-- 添加用户的对话框 -->
  <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
  >
  <!-- 内容主体区 -->
  <el-form :model="addForm"
           :rules="addFormRules"
           ref="addFormRef"
           label-width="100px"
           class="demo-ruleForm">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="addForm.username"></el-input>
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="addForm.password"></el-input>
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="addForm.email"></el-input>
    </el-form-item>
    <el-form-item label="手机" prop="mobile">
      <el-input v-model="addForm.mobile"></el-input>
    </el-form-item>
  </el-form>
  <!-- 底部区域 -->
  <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
</el-dialog>
<!-- 修改用户的对话框 -->
<el-dialog
  title="修改用户"
  :visible.sync="editDialogVisible"
  width="50%"
  @close="editDialogClosed"
  >
  <el-form
    :model="editForm"
    ref="editFormRef"
    label-width="70px"
    :rules="editFormRules"
  >
    <el-form-item label="用户名" >
      <el-input v-model="editForm.username" disabled></el-input>
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="editForm.email"></el-input>
    </el-form-item>
    <el-form-item label="手机号" prop="mobile">
      <el-input v-model="editForm.mobile"></el-input>
    </el-form-item>
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUser">确 定</el-button>
  </el-form>
</el-dialog>

<!-- 分配角色的对话框 -->
<el-dialog
  title="分配角色"
  :visible.sync="setRoleDialogVisible"
  width="50%"
  @close="setRoleDialogClosed"
  >
  <div>
    <p>当前的用户:{{userInfo.username}}</p>
    <p>当前的角色:{{userInfo.role_name}}</p>
    <p>分配新角色:
      <el-select v-model="selectedRoleId" placeholder="请选择">
        <el-option
          v-for="item in rolesList"
          :key="item.id"
          :label="item.roleName"
          :value="item.id">
        </el-option>
    </el-select>
    </p>
  </div>

  <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
</el-dialog>

</div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    // 验证邮箱的规则
    const checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb();
      }
      cb(new Error('请输入合法的邮箱'));
    };
    // 验证手机号规则
    const checkMoblie = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|1751)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error('请输入合法的手机号'));
    };
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2,
      },
      userlist: [],
      // 表示返回的用户数量
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {},
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6, max: 15, message: '密码的长度在6~10个字符之间', trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMoblie, trigger: 'blur' },
        ],
      },
      editDialogVisible: false,
      // 修改用户的对象的信息
      editForm: {},
      // 修改用户信息表中的规则
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入用户手机号码', trigger: 'blur' },
          { validator: checkMoblie, trigger: 'blur' },
        ],
      },
      setRoleDialogVisible: false,
      // 需要被分配角色用户信息
      userInfo: {},
      // 所有的角色的数组列表
      rolesList: [],
      // 已选中的角色id值
      selectedRoleId: '',

    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      // 获取请求的参数都放在params中
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败');
      }
      this.userlist = res.data.users;
      this.total = res.data.total;
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 切换页码时会触发的函数
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听switch的变化
    async userStateChange(userInfo) {
      console.log(userInfo);
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/state/${userInfo.mg_state}`);
      if (res.meta.status !== 200) {
      // 状态修改失败是修改数据库的操作失败，但是此时的用户状态再用户界面上是已经修改过的
      // 所以要恢复状态
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error('更新用户状态失败！');
      }
      this.$message.success('更新用户状态成功');
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      console.log(111);
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮，添加新用户
    addUser() {
    // 点击确定之后，对输入的内容进行预验证
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm);
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败！');
        }
        this.$message.success('添加用户成功');
        // 隐藏添加的对话框
        this.addDialogVisible = false;
        // 刷新用户列表数据
        this.getUserList();
      });
    },
    // 展示编辑用户的对话框
    showEditDialog(editUser) {
      this.editForm = editUser;
      this.editDialogVisible = true;
    },
    // 修改用户信息并提交
    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.put(`users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile,
        });

        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败！');
        }

        // 关闭对话框
        this.editDialogVisible = false;
        // 刷新数据列表
        this.getUserList();
        // 提示修改成功
        this.$message.success('更新用户信息成功');
      });
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 根据id删除对应用户的信息
    async deleteUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const { data: res } = await this.$http.delete(`users/${id}`);

        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败');
        }
        //  删除成功
        this.$message({
          type: 'success',
          message: '删除成功!',
        });
        this.getUserList();
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
        });
      });
    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo;
      // 获取所有的角色的列表
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败');
      }
      // 保存获取的角色信息
      this.rolesList = res.data;
      this.setRoleDialogVisible = true;
    },
    // 点击确定按钮，分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色');
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId });
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败');
      }

      this.$message.success('更新角色成功');
      this.getUserList();
      this.setRoleDialogVisible = false;
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
    // 将selected框中的选择值置位空
      this.selectedRoleId = '';
      // 把当前选中的用户信息置位空
      this.userInfo = {};
    },

  },

};

</script>

<style lang='less' scoped>
.user{
  width: 100%;
  height: 20px;
  background: red;
}
</style>
