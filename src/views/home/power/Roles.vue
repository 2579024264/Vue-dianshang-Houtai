<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
</el-breadcrumb>
<!-- 卡片视图 -->
<el-card>
  <!-- 添加角色按钮区域 -->
    <el-row>
      <el-col><el-button type="primary"> 添加角色</el-button></el-col>
    </el-row>
    <!-- 角色列表区 -->
</el-card>
<el-table :data="rolelist" border stripe>
  <!-- 展开列 -->
  <el-table-column type="expand">
    <template slot-scope="scope">
      <el-row v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom',index1 === 0 ? 'bdtop':'' ,'vcenter']">
        <!-- 渲染一级权限 -->
        <el-col :span="5">
          <el-tag
            closable
            @close="remveRightById(scope.row,item1.id)" >{{item1.authName}}</el-tag>
          <i class="el-icon-caret-right"></i>

        </el-col>
        <!-- 渲染二级和三级权限 -->
        <el-col :span="19">
          <!-- 通过循环嵌套渲染二级权限 -->
          <el-row v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                  :class="[index2 === 0 ? '': 'bdtop','vcenter']"
                  >
            <el-col :span="6">
              <el-tag type="success"
               closable
              @close="remveRightById(scope.row,item2.id)"
              >{{item2.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <el-col :span="18">
              <el-tag type="warning"
              v-for="item3 in item2.children"
              :key="item3.id"
              closable
              @close="remveRightById(scope.row,item3.id)"
              >{{item3.authName}}</el-tag>

            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </template>
  </el-table-column>
  <!-- 索引列 -->
  <el-table-column type="index" label="#"></el-table-column>
  <el-table-column  label="角色名称" prop="roleName"></el-table-column>
  <el-table-column  label="角色描述" prop="roleDesc"></el-table-column>
  <el-table-column  label="操作" >
    <template slot-scope="scope">
      <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
      <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
      <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
    </template>
  </el-table-column>
</el-table>
<!-- 分配权限的对话框 -->
<el-dialog
  title="分配权限"
  :visible.sync="setRightDialogVisible"
  width="50%"
  @close="setRightDialogClosed"
  >
  <!-- 树形控件 -->
  <el-tree :data="rightslist"
           :props="treeProps"
           show-checkbox
           node-key="id"
           default-expand-all
           :default-checked-keys="defKeys"
            ref="treeRef"
           ></el-tree>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button
      type="primary"
      @click="allotRights">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      // 默认选中的节点id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取所有的角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles');

      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败');
      }
      this.rolelist = res.data;
    // console.log(this.rolelist)
    },

    // 根据id删除对应的权限
    async remveRightById(role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户的权限', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => err);
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除操作!');
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败!');
      }
      // 为了防止删除之后，因重新渲染的问题从而导致关闭，这里使用局部数据刷新的方式
      // 而不使用this.getRolesList()来进行全部数据的获取。
      role.children = res.data;
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree');
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败!');
      }

      // 把获取到的权限数据保存到data中
      this.rightslist = res.data;

      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys);

      // 保存当前角色的id值
      this.roleId = role.id;

      this.setRightDialogVisible = true;
    },
    // 通过丢贵的形式，获取角色下所有三级权限的id值，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = [];
    },
    // 点击为角色分配权限
    async  allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedNodes(),
      ];
      // 将id数组转成以','分割的字符串
      const idStr = keys.join(',');
      // 直接将要分配的权限id传到后台，永久修改角色的权限
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr });
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败!');
      }
      this.$message.success('角色权限分配成功');
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
  },
};

</script>

<style lang='less' scoped>
.el-tag{
  margin: 7px;
}
.bdtop{
  border-top: 1px solid #eee;
}
.bdbottom{
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}

</style>
