<template>
 <div class="rights">
    <!-- 面包屑区 -->
   <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
   </el-breadcrumb>
   <!-- 卡片视图区 -->
   <el-card>
     <el-row>
       <el-col>
        <el-button type="primary"   @click="showAddCateDialog">添加分类</el-button>
       </el-col>
     </el-row>
     <!-- 表格 -->
     <tree-table
                class="treeTable"
                :data="catelist"
                 :columns="columns"
                 :selection-type="false"
                 :expand-type="false"
                 show-index
                 index-text="#"
                 border
                 :show-row-hover="false"
                 >
                 <!-- 这里的isok和columns中的prop属性的值一致 -->
                 <template slot="isok"  slot-scope="scope">
                   <i class="el-icon-success"
                      v-if="scope.row.cat_deleted===false"
                      style="color:lightgreen"></i>
                   <i class="el-icon-error" v-else
                      style="color:red"></i>
                 </template>
                 <template slot="order" slot-scope="scope">
                   <el-tag v-if="scope.row.cat_level===0" size="mini">一级</el-tag>
                   <el-tag v-else-if="scope.row.cat_level===1" size="mini" type="success">二级</el-tag>
                   <el-tag v-else type="warning" size="mini">三级</el-tag>

                 </template>
                 <template slot="opt">
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                 </template>
     </tree-table>
       <!-- 分页区域 -->
     <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3,5,10,15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>
   </el-card>
   <!-- 添加分类的对话框 -->
   <el-dialog
    title="添加分类"
    :visible.sync="addCateDialogVisible"
    width="50%"
    @close="addCateDialogClosed"
    >
    <el-form ref="addCateFormRef"
            :model="addCateForm"
            label-width="80px"
            :rules="addCateFormRules">
      <el-form-item label="分类名称"  prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
      </el-form-item>
      <el-form-item label="父级分类">
        <!-- options 用来指定数据源 -->
        <!-- props用来指定配置对象 -->
        <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            expandTrigger='hover'
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            :change-on-select="true"
            >
        </el-cascader>
      </el-form-item>
    </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
</el-dialog>
 </div>
</template>

<script>
export default {
  name: 'Cate',
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 数据总条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',

        },
        {
          label: '是否有效',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前那这一列使用模板名称
          template: 'isok',
        },
        {
          label: '排序',
          type: 'template',
          template: 'order',
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt',
        },
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类 的id
        cat_pid: 0,
        // 当前分类的等级，默认添加为父级分类
        cat_level: 0,
      },
      // 添加分类的验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' },

        ],
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      // value指的是真正提交的值
      // label是看到的名称
      // children表示父子之间关联的属性
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 选中的父级分类的id数组 保存的是选中后父子的value值(id)
      selectedKeys: [],
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo });
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品失败');
      }
      this.catelist = res.data.result;
      this.total = res.data.total;
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击按钮显示分类对话框
    showAddCateDialog() {
    // 先获取父级分类的数据列表
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      });
      console.log(res.data);
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败!');
      }
      this.parentCateList = res.data;
    },
    // 级联选择器中选项发生变化触发这个函数
    parentCateChanged() {
    // 如果selectedKeys 数组中的length大于0，证明选中的了父级分类
    // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        // 为当前分类的等级的赋值 0 1 2
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0;
        // 为当前分类的等级的赋值
        this.addCateForm.cat_level = 0;
      }
    // console.log(this.selectedKeys)
    },
    // 点击按钮添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post('categories', this.addCateForm);
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败!');
        }
        this.$message.success('添加分类成功');
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
  },

};

</script>

<style lang='less' scoped>
.treeTable{
  margin-top: 15px;
}

</style>
