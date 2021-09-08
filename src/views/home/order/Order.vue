<template>
  <div>
    <!-- 面包屑导航区 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>订单管理</el-breadcrumb-item>
    <el-breadcrumb-item>订单列表</el-breadcrumb-item>
</el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表数据 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号"  prop="order_number"></el-table-column>
        <el-table-column  label="订单价格" prop="order_price"></el-table-column>
        <el-table-column  label="是否付款" prop="pay_status">
          <template slot-scope="scope">
              <el-tag v-if="scope.row.pay_status === '0'" type="danger">未付款</el-tag>
              <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column  label="是否发货" prop="is_send"></el-table-column>
        <el-table-column  label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column  label="操作" >
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button type="success" size="mini" icon="el-icon-location" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页码条区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 15, 20, 25]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>
    </el-card>
  <!-- 修改地址的对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      >
      <el-form ref="addressFormRef" :model="addressForm" :rules="addressFormRules">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cictyData" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="addressVisible = false">取 消</el-button>
      <el-button type="primary" @click="addressVisible = false">确 定</el-button>
    </span>
</el-dialog>
<!-- 查看物流进度的对话框 -->
<el-dialog
  title="物流进度"
  :visible.sync="progressVisible"
  width="50%">
  <!-- 时间线组件 -->
   <el-timeline >
    <el-timeline-item
      v-for="(activity, index) in progressInfo"
      :key="index"
      :timestamp="activity.time">
      {{activity.context}}
    </el-timeline-item>
  </el-timeline>
</el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Order',
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      // 订单数据列表
      orderlist: [],
      // 地址对话框是否显示
      addressVisible: false,
      // 对话框表单数据
      addressForm: {
        address1: [],
        address2: '',
      },
      addressFormRules: {
        addrsss1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' },
        ],
        addrsss2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' },
        ],
      },
      cictyData: [
        { sheng: '山西', shi: 'taiyuan', qu: 'jiancaopingqu' },
      ],
      progressVisible: false,
      // 获取到的物流信息数组
      progressInfo: [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收，感谢使用顺丰，期待再次为您服务',
          location: '',
        },
        {
          time: '2018-05-10 08:25:00',
          ftime: '2018-05-10 08:39:00',
          context: '【北京市】北京海淀育新小区营业点派件员，神风速运 95338正在为您派件',
          location: '',
        },
        {

          time: '2018-05-11 06:25:00',
          ftime: '2018-05-11 06:39:00',
          context: '快件到达【北京海淀育新小区营业点】',
          location: '',
        },
      ],

    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo });
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败！');
      }
      this.total = res.data.total;
      this.orderlist = res.data.goods;
    },
    // 页码数发生改变时候触发
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    // 页码值发生变化也会触发
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getOrderList();
    },
    // 点击显示地址编辑对话框
    showBox() {
      this.addressVisible = true;
    },
    // 显示物流进度的对话框
    async showProgressBox() {
      //  const{data:res}= await this.$http.get(`/kuaidi/`)
      //  if(res.meta.status !==200){
      //   return  this.$message.error("获取物流进度失败!")
      //  }
      //  this.progressInfo=res.data;
      //  this.$message.success("成功获取物流信息")
      this.progressVisible = true;
    },

  },
};

</script>

<style lang='less' scoped>
.el-cascader{
  width: 100%;
}

</style>
