<template>
  <div>
    <!-- 面包屑导航区 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>添加列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片视图 -->
   <el-card>
     <!-- 消息提示区-->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
        effect="dark">
  </el-alert>
  <!-- 步骤条区 -->
  <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
    <el-step title="基本信息"></el-step>
    <el-step title="商品参数"></el-step>
    <el-step title="商品属性"></el-step>
    <el-step title="商品图片"></el-step>
    <el-step title="商品内容"></el-step>
    <el-step title="完成"></el-step>
  </el-steps>
  <!-- tab栏区 -->
  <el-form :model="addForm"
           :rules="addFormRules"
           ref="addFormRef"
           label-width="100px"
           label-position="top">
    <el-tabs v-model="activeIndex"
             :tab-position="'left'"
             :before-leave="beforeTabLeave"
             @tab-click="tabClicked">
      <el-tab-pane label="基本信息" name="0">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="addForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="addForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="addForm.goods_weight"  type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number" >
          <el-input v-model="addForm.goods_number" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品分类" prop="goods_cat">
          <el-cascader
            v-model="addForm.goods_cat"
            :options="catelist"
             expandTrigger='hover'
            :props="cateProps"
            @change="handleChange">
          </el-cascader>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品参数" name="1" >
        <!-- 渲染表单的item项 -->
        <el-form-item  v-for="item in manyTableData"
                        :key="item.attr_id"
                      :label="item.attr_name">
        <el-checkbox-group v-model="item.attr_vals">
          <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
        </el-checkbox-group>

        </el-form-item>
        <el-form-item></el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品属性" name="2">
        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
          <el-input v-model="item.attr_vals"></el-input>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品图片" name="3">
        <!-- action表示图片要上传到后台api地址 -->
        <!-- on-preview 表示预览图片时出触发的事件-->
        <!-- list-type表示图片的展现形式  这里使用的picture形式展示 -->
        <!-- headers：设置图片上传请求头，里面携带了token值 -->
        <!-- on-Success:当图片成功上传之后触发的钩子 -->
        <!-- on-remove 问价列表移除文件时的钩子 -->
        <el-upload
          class="upload-demo"
          :action="uploadURL"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          list-type="picture"
          :headers="headerObj"
          :on-success="handleSuccess">
          <el-button size="small" type="primary">点击上传</el-button>
       </el-upload>
      </el-tab-pane>
      <el-tab-pane label="商品内容" name="4">
          <!-- 富文本编辑器组件 -->
          <quill-editor v-model="addForm.goods_introduce"></quill-editor>
          <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
      </el-tab-pane>
    </el-tabs>
  </el-form>
   </el-card>
   <!-- 图片预览的对话框区 -->
   <el-dialog
    title="图片预览"
    :visible.sync="previewVisible"
    width="50%">
    <img :src="previewPath" alt="" class="previewImg">
</el-dialog>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'Add',
  data() {
    return {
      activeIndex: '0',
      // 添加商品表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 成功上传商品图片后返回的数据
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: [],
      },
      // 表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' },

        ],
      },
      // 商品分类列表
      catelist: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的URL
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的header请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      // 图片返回的真实url路径
      previewPath: '',
      // 对话框的显示与隐藏
      previewVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取所有商品的分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories');
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败!');
      }
      this.catelist = res.data;
      console.log(this.catelist);
    },
    // 级联选择器选中项变化，会触发这个函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforeTabLeave(activeName, oldActivename) {
      if (oldActivename === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类');
        // 返回false表示不允许进入下一个tab页
        return false;
      }
    },
    // 当点击标签页的时候触发的函数
    async tabClicked() {
      // 当访问的时动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' },
        });
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败!');
        }
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',');
        });
        this.manyTableData = res.data;
        console.log(this.manyTableData);
      }
      if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' },
        });
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败!');
        }
        console.log(res.data);
        this.onlyTableData = res.data;
      }
    },
    // 处理图片预览效果
    handlePreview() {
      console.log(1111);
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // file是将要移除的文件对象
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2.从 pics数组中，找到这和个图片对应的索引值
      const i = this.addForm.pics.findIndex((x) => {
        x.pic === filePath;
      });
      // 3.调用数组的splice方法，把图片信息对象，从pics数组中移除
      this.addForm.pics.splice(i, 1);
    },
    // 监听图片成功上传的钩子
    handleSuccess(res) {
      // res是服务器返回的对象
      // 1.拼接得到一个图片信息对象
      const picInfo = { pic: res.data.tmp_path };
      // 2.将图片信息对象push到pics数组中
      this.addForm.pics.push(picInfo);
    },
    // 处理图片效果
    handlePreview(file) {
      // file是图片上传成功后返回的数据
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请填写必须要的商品信息');
        }
        // 执行添加的任务  将数组转换为','分割的字符串
        // loadh cloneDeep(obj) 实现深拷贝
        const Form = _.cloneDeep(this.addForm);
        Form.goods_cat = Form.goods_cat.join(',');
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(','),
          };
          this.addForm.attrs.push(newInfo);
        });
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals };
          this.addForm.attrs.push(newInfo);
        });
        Form.attrs = this.addForm.attrs;

        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const { data: res } = await this.$http.post('goods', Form);
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败!');
        }
        this.$message.success('添加商品成功!');
        this.$router.push('/goods');
      });
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
    },
  },
};

</script>

<style lang='less' scoped>

.el-steps{
  margin: 20px 0;
}
.el-checkbox{
  margin-right: 5px !important;
}
.previewImg{
  width: 100%;
}
.btnAdd{
  margin-top: 20px;
}

</style>
