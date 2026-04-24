<template>
  <Layout>
    <div class="users-page">
      <el-card>
        <el-tabs v-model="active_tab">
          <el-tab-pane label="司机管理" name="siji">
            <div class="table-toolbar">
              <el-button type="primary" @click="open_siji_dialog()">
                <el-icon><Plus /></el-icon> 添加司机
              </el-button>
              <el-button type="info" @click="open_ticheng_config_dialog()">
                <el-icon><Setting /></el-icon> 提成配置
              </el-button>
              <el-input v-model="search_siji" placeholder="搜索司机姓名或手机号" style="width: 300px;" clearable />
            </div>
            <el-table :data="filtered_siji_list" style="width: 100%; margin-top: 20px;">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="xingming" label="姓名" />
              <el-table-column prop="shouji" label="手机号" />
              <el-table-column prop="chepai" label="车牌号" />
              <el-table-column prop="ticheng_bili" label="提成比例" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.ticheng_bili ? 'success' : 'info'">
                    {{ row.ticheng_bili || tongyi_ticheng }}%
                  </el-tag>
                  <span v-if="row.ticheng_bili" class="custom-tag">自定义</span>
                </template>
              </el-table-column>
              <el-table-column prop="zhuangtai" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.zhuangtai === 1 ? 'success' : 'danger'">
                    {{ row.zhuangtai === 1 ? '正常' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="350">
                <template #default="{ row }">
                  <el-button size="small" type="primary" @click="view_siji_detail(row)">详情</el-button>
                  <el-button size="small" @click="open_siji_dialog(row)">编辑</el-button>
                  <el-button size="small" type="warning" @click="open_ticheng_dialog(row)">设置提成</el-button>
                  <el-button size="small" :type="row.zhuangtai === 1 ? 'warning' : 'success'" @click="toggle_siji_status(row)">
                    {{ row.zhuangtai === 1 ? '禁用' : '启用' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="乘客管理" name="chengke">
            <div class="table-toolbar">
              <el-button type="primary" @click="open_chengke_dialog()">
                <el-icon><Plus /></el-icon> 添加乘客
              </el-button>
              <el-input v-model="search_chengke" placeholder="搜索乘客姓名或手机号" style="width: 300px;" clearable />
            </div>
            <el-table :data="filtered_chengke_list" style="width: 100%; margin-top: 20px;">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="xingming" label="姓名" />
              <el-table-column prop="shouji" label="手机号" />
              <el-table-column prop="gongsi" label="公司名称" />
              <el-table-column label="操作" width="300">
                <template #default="{ row }">
                  <el-button size="small" type="primary" @click="view_chengke_detail(row)">详情</el-button>
                  <el-button size="small" @click="open_chengke_dialog(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="delete_chengke(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 司机编辑弹窗 -->
      <el-dialog :title="current_siji.id ? '编辑司机' : '添加司机'" v-model="siji_dialog_visible" width="500px">
        <el-form :model="current_siji" label-width="100px">
          <el-form-item label="姓名"><el-input v-model="current_siji.xingming" placeholder="请输入姓名" /></el-form-item>
          <el-form-item label="手机号"><el-input v-model="current_siji.shouji" placeholder="请输入手机号" /></el-form-item>
          <el-form-item label="车牌号"><el-input v-model="current_siji.chepai" placeholder="请输入车牌号" /></el-form-item>
          <el-form-item label="备注"><el-input v-model="current_siji.beizhu" type="textarea" placeholder="请输入备注" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="siji_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="save_siji()">保存</el-button>
        </template>
      </el-dialog>

      <!-- 乘客编辑弹窗 -->
      <el-dialog :title="current_chengke.id ? '编辑乘客' : '添加乘客'" v-model="chengke_dialog_visible" width="500px">
        <el-form :model="current_chengke" label-width="100px">
          <el-form-item label="姓名"><el-input v-model="current_chengke.xingming" placeholder="请输入姓名" /></el-form-item>
          <el-form-item label="手机号"><el-input v-model="current_chengke.shouji" placeholder="请输入手机号" /></el-form-item>
          <el-form-item label="公司名称"><el-input v-model="current_chengke.gongsi" placeholder="请输入公司名称" /></el-form-item>
          <el-form-item label="备注"><el-input v-model="current_chengke.beizhu" type="textarea" placeholder="请输入备注" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="chengke_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="save_chengke()">保存</el-button>
        </template>
      </el-dialog>

      <!-- 司机提成设置弹窗 -->
      <el-dialog title="设置司机提成比例" v-model="ticheng_dialog_visible" width="500px">
        <el-form :model="ticheng_form" label-width="150px">
          <el-form-item label="司机姓名">
            <el-input v-model="ticheng_form.xingming" disabled />
          </el-form-item>
          <el-form-item label="当前统一比例">
            <el-tag>{{ tongyi_ticheng }}%</el-tag>
            <span class="tip-text">系统默认提成比例</span>
          </el-form-item>
          <el-form-item label="自定义提成比例">
            <el-slider v-model="ticheng_form.ticheng_bili" :max="100" show-stops :step="5" show-input />
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="ticheng_form.use_default">使用统一比例</el-checkbox>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="ticheng_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="save_ticheng()">保存</el-button>
        </template>
      </el-dialog>

      <!-- 统一提成配置弹窗 -->
      <el-dialog title="统一提成比例配置" v-model="ticheng_config_visible" width="500px">
        <el-form label-width="150px">
          <el-form-item label="统一提成比例">
            <el-slider v-model="tongyi_ticheng" :max="100" show-stops :step="5" show-input />
            <div class="tip-text">所有司机默认使用此提成比例，可在司机列表中单独设置</div>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="ticheng_config_visible = false">取消</el-button>
          <el-button type="primary" @click="save_tongyi_ticheng()">保存</el-button>
        </template>
      </el-dialog>

      <!-- 司机详情弹窗 -->
      <el-dialog title="司机详情" v-model="siji_detail_visible" width="900px">
        <div v-if="current_siji_detail.id" class="siji-detail-content">
          <el-divider content-position="left">基本信息</el-divider>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="ID">{{ current_siji_detail.id }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ current_siji_detail.xingming }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ current_siji_detail.shouji }}</el-descriptions-item>
            <el-descriptions-item label="车牌号">{{ current_siji_detail.chepai }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="current_siji_detail.zhuangtai === 1 ? 'success' : 'danger'">
                {{ current_siji_detail.zhuangtai === 1 ? '正常' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ current_siji_detail.zhuce_shijian }}</el-descriptions-item>
            <el-descriptions-item label="提成比例">
              <el-tag :type="current_siji_detail.ticheng_bili ? 'success' : 'info'">
                {{ current_siji_detail.ticheng_bili || tongyi_ticheng }}%
              </el-tag>
              <span v-if="current_siji_detail.ticheng_bili" class="custom-tag">自定义</span>
              <span v-else class="default-tag">使用统一比例</span>
            </el-descriptions-item>
            <el-descriptions-item label="评分"><el-rate v-model="current_siji_detail.pingfen" disabled show-score /></el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ current_siji_detail.beizhu || '无' }}</el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">统计数据</el-divider>
          <el-row :gutter="20">
            <el-col :span="6"><div class="stat-card"><div class="stat-value">{{ current_siji_detail.tongji?.wancheng_dingdan || 0 }}</div><div class="stat-label">完成订单</div></div></el-col>
            <el-col :span="6"><div class="stat-card"><div class="stat-value">{{ current_siji_detail.tongji?.zongjine || '¥0.00' }}</div><div class="stat-label">总金额</div></div></el-col>
            <el-col :span="6"><div class="stat-card"><div class="stat-value">{{ current_siji_detail.tongji?.jujue_cishu || 0 }}</div><div class="stat-label">拒绝次数</div></div></el-col>
            <el-col :span="6"><div class="stat-card"><div class="stat-value">{{ current_siji_detail.tongji?.zaixian_shichang || '0h' }}</div><div class="stat-label">在线时长</div></div></el-col>
          </el-row>

          <el-divider content-position="left">实时定位</el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="当前位置">{{ current_siji_detail.dingwei?.dizhi || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ current_siji_detail.dingwei?.gengxin_shijian || '-' }}</el-descriptions-item>
            <el-descriptions-item label="坐标">{{ current_siji_detail.dingwei?.jingdu ? `${current_siji_detail.dingwei.jingdu.toFixed(6)}, ${current_siji_detail.dingwei.weidu.toFixed(6)}` : '-' }}</el-descriptions-item>
            <el-descriptions-item label="速度">{{ current_siji_detail.dingwei?.sudu || '0 km/h' }}</el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">拒绝记录</el-divider>
          <el-table :data="current_siji_detail.jujue_jilu || []" style="width: 100%;" empty-text="暂无拒绝记录">
            <el-table-column prop="dingdan" label="订单号" />
            <el-table-column prop="yuanyin" label="拒绝原因" />
            <el-table-column prop="shijian" label="拒绝时间" />
            <el-table-column prop="chuli_jieguo" label="处理结果">
              <template #default="{ row }">
                <span v-if="row.chuli_jieguo === 'reassign'">已重新指派给 {{ row.new_siji }}</span>
                <span v-else-if="row.chuli_jieguo === 'cancel'">已取消订单</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="chuli_shijian" label="处理时间" />
          </el-table>
        </div>
        <template #footer>
          <el-button @click="siji_detail_visible = false">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 乘客详情弹窗 -->
      <el-dialog title="乘客详情" v-model="chengke_detail_visible" width="900px">
        <div v-if="current_chengke_detail.id" class="chengke-detail-content">
          <el-divider content-position="left">基本信息</el-divider>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="ID">{{ current_chengke_detail.id }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ current_chengke_detail.xingming }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ current_chengke_detail.shouji }}</el-descriptions-item>
            <el-descriptions-item label="公司名称">{{ current_chengke_detail.gongsi || '无' }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ current_chengke_detail.beizhu || '无' }}</el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">消费统计</el-divider>
          <el-row :gutter="20">
            <el-col :span="6"><div class="stat-card"><div class="stat-value">{{ current_chengke_detail.tongji?.dingdan_shu || 0 }}</div><div class="stat-label">订单数量</div></div></el-col>
            <el-col :span="6"><div class="stat-card"><div class="stat-value">{{ current_chengke_detail.tongji?.zongjine || '¥0.00' }}</div><div class="stat-label">总消费金额</div></div></el-col>
            <el-col :span="6"><div class="stat-card"><div class="stat-value">{{ current_chengke_detail.tongji?.pingjun_jine || '¥0.00' }}</div><div class="stat-label">平均订单金额</div></div></el-col>
            <el-col :span="6"><div class="stat-card"><div class="stat-value">{{ current_chengke_detail.tongji?.wancheng_dingdan || 0 }}</div><div class="stat-label">已完成订单</div></div></el-col>
          </el-row>

          <el-divider content-position="left">订单历史</el-divider>
          <el-table :data="current_chengke_detail.dingdan_list || []" style="width: 100%;" empty-text="暂无订单记录">
            <el-table-column prop="dingdanhao" label="订单号" />
            <el-table-column prop="shifadi" label="始发地" show-overflow-tooltip />
            <el-table-column prop="mudedi" label="目的地" show-overflow-tooltip />
            <el-table-column prop="jine" label="金额" />
            <el-table-column prop="zhuangtai" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.zhuangtai === 5 ? 'success' : row.zhuangtai === 6 ? 'danger' : 'primary'">
                  {{ get_status_label(row.zhuangtai) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="chuangjian_shijian" label="创建时间" />
          </el-table>
        </div>
        <template #footer>
          <el-button @click="chengke_detail_visible = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, MapLocation, Setting } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'
import { log_ticheng_change, log_user_action, log_caozuo, type CaozuoType } from '~/utils/caozuo-log'

const active_tab = ref('siji')
const search_siji = ref('')
const search_chengke = ref('')
const siji_dialog_visible = ref(false)
const chengke_dialog_visible = ref(false)
const siji_detail_visible = ref(false)
const chengke_detail_visible = ref(false)
const ticheng_dialog_visible = ref(false)
const ticheng_config_visible = ref(false)
const current_siji_detail = ref<any>({})
const current_chengke_detail = ref<any>({})

// 统一提成比例
const tongyi_ticheng = ref(60)

// 加载统一提成比例
onMounted(() => {
  const jifei_config = localStorage.getItem('jifei_config')
  if (jifei_config) {
    const config = JSON.parse(jifei_config)
    tongyi_ticheng.value = config.tongyi_ticheng || 60
  }
})

const siji_list = ref([
  { id: 1, xingming: '王师傅', shouji: '13800138001', chepai: '京A12345', zhuangtai: 1, beizhu: '', zhuce_shijian: '2024-01-15', pingfen: 4.8, ticheng_bili: null },
  { id: 2, xingming: '赵师傅', shouji: '13800138002', chepai: '京B23456', zhuangtai: 1, beizhu: '', zhuce_shijian: '2024-02-20', pingfen: 4.5, ticheng_bili: 65 },
  { id: 3, xingming: '李师傅', shouji: '13800138003', chepai: '京C34567', zhuangtai: 0, beizhu: '', zhuce_shijian: '2024-03-10', pingfen: 4.2, ticheng_bili: null }
])

const chengke_list = ref([
  { id: 1, xingming: '张三', shouji: '13900139001', gongsi: '某科技公司', beizhu: '' },
  { id: 2, xingming: '李四', shouji: '13900139002', gongsi: '某贸易公司', beizhu: '' },
  { id: 3, xingming: '王五', shouji: '13900139003', gongsi: '', beizhu: '' }
])

const current_siji = ref({ id: null as any, xingming: '', shouji: '', chepai: '', beizhu: '' })
const current_chengke = ref({ id: null as any, xingming: '', shouji: '', gongsi: '', beizhu: '' })
const ticheng_form = ref({ id: null as any, xingming: '', ticheng_bili: 60, use_default: false })

const filtered_siji_list = computed(() => {
  if (!search_siji.value) return siji_list.value
  const kw = search_siji.value.toLowerCase()
  return siji_list.value.filter(s => s.xingming.toLowerCase().includes(kw) || s.shouji.includes(kw))
})

const filtered_chengke_list = computed(() => {
  if (!search_chengke.value) return chengke_list.value
  const kw = search_chengke.value.toLowerCase()
  return chengke_list.value.filter(c => c.xingming.toLowerCase().includes(kw) || c.shouji.includes(kw))
})

function view_siji_detail(row: any) {
  const jujue_records = JSON.parse(localStorage.getItem(`siji_jujue_records_${row.id}`) || '[]')
  current_siji_detail.value = {
    ...row,
    tongji: {
      wancheng_dingdan: Math.floor(Math.random() * 100) + 50,
      zongjine: '¥' + (Math.floor(Math.random() * 50000) + 10000).toFixed(2),
      jujue_cishu: jujue_records.length || Math.floor(Math.random() * 5),
      zaixian_shichang: Math.floor(Math.random() * 2000) + 500 + 'h'
    },
    dingwei: {
      dizhi: '西安市雁塔区',
      jingdu: 108.960000 + Math.random() * 0.1,
      weidu: 34.220000 + Math.random() * 0.1,
      sudu: Math.floor(Math.random() * 60) + ' km/h',
      gengxin_shijian: new Date().toLocaleString()
    },
    jujue_jilu: jujue_records
  }
  siji_detail_visible.value = true
}

function open_siji_dialog(row: any = null) {
  current_siji.value = row ? { ...row } : { id: null, xingming: '', shouji: '', chepai: '', beizhu: '' }
  siji_dialog_visible.value = true
}

function open_chengke_dialog(row: any = null) {
  current_chengke.value = row ? { ...row } : { id: null, xingming: '', shouji: '', gongsi: '', beizhu: '' }
  chengke_dialog_visible.value = true
}

function open_ticheng_dialog(row: any) {
  ticheng_form.value = {
    id: row.id,
    xingming: row.xingming,
    ticheng_bili: row.ticheng_bili || tongyi_ticheng.value,
    use_default: !row.ticheng_bili
  }
  ticheng_dialog_visible.value = true
}

function open_ticheng_config_dialog() {
  ticheng_config_visible.value = true
}

async function toggle_siji_status(row: any) {
  try {
    const action = row.zhuangtai === 1 ? '禁用' : '启用'
    await ElMessageBox.confirm(`确定要${action}该司机吗？`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    row.zhuangtai = row.zhuangtai === 1 ? 0 : 1
    ElMessage.success(`${action}成功`)
  } catch {}
}

function save_siji() {
  if (!current_siji.value.xingming || !current_siji.value.shouji) {
    ElMessage.warning('请填写必填项')
    return
  }
  if (current_siji.value.id) {
    ElMessage.success('编辑成功')
  } else {
    const new_id = Math.max(...siji_list.value.map(i => i.id)) + 1
    siji_list.value.unshift({ ...current_siji.value, id: new_id, zhuangtai: 1, zhuce_shijian: new Date().toLocaleDateString(), pingfen: 5.0, ticheng_bili: null })
    ElMessage.success('添加成功')
  }
  siji_dialog_visible.value = false
}

function save_chengke() {
  if (!current_chengke.value.xingming || !current_chengke.value.shouji) {
    ElMessage.warning('请填写必填项')
    return
  }
  if (current_chengke.value.id) {
    ElMessage.success('编辑成功')
  } else {
    const new_id = Math.max(...chengke_list.value.map(i => i.id)) + 1
    chengke_list.value.unshift({ ...current_chengke.value, id: new_id })
    ElMessage.success('添加成功')
  }
  chengke_dialog_visible.value = false
}

function save_ticheng() {
  const siji = siji_list.value.find(s => s.id === ticheng_form.value.id)
  if (siji) {
    const old_bili = siji.ticheng_bili
    const new_bili = ticheng_form.value.use_default ? null : ticheng_form.value.ticheng_bili
    
    if (ticheng_form.value.use_default) {
      siji.ticheng_bili = null
    } else {
      siji.ticheng_bili = ticheng_form.value.ticheng_bili
    }
    
    // 记录操作日志
    log_ticheng_change(siji.xingming, old_bili, new_bili)
    
    ElMessage.success('提成比例设置成功')
  }
  ticheng_dialog_visible.value = false
}

function save_tongyi_ticheng() {
  const jifei_config = localStorage.getItem('jifei_config')
  let config = jifei_config ? JSON.parse(jifei_config) : {}
  config.tongyi_ticheng = tongyi_ticheng.value
  localStorage.setItem('jifei_config', JSON.stringify(config))
  ElMessage.success('统一提成比例已保存')
  ticheng_config_visible.value = false
}

// 查看乘客详情
function view_chengke_detail(row: any) {
  // 从订单列表中获取该乘客的订单
  const orders = JSON.parse(localStorage.getItem('order_list') || '[]')
  const chengke_orders = orders.filter((o: any) => o.chengke === row.xingming || o.chengke_xingming === row.xingming)
  
  const total_orders = chengke_orders.length
  const completed_orders = chengke_orders.filter((o: any) => o.zhuangtai === 5).length
  const total_amount = chengke_orders.reduce((sum: number, o: any) => {
    const amount = parseFloat((o.jine || '¥0').replace('¥', ''))
    return sum + amount
  }, 0)
  const avg_amount = total_orders > 0 ? total_amount / total_orders : 0

  current_chengke_detail.value = {
    ...row,
    tongji: {
      dingdan_shu: total_orders,
      wancheng_dingdan: completed_orders,
      zongjine: '¥' + total_amount.toFixed(2),
      pingjun_jine: '¥' + avg_amount.toFixed(2)
    },
    dingdan_list: chengke_orders.map((o: any) => ({
      dingdanhao: o.dingdanhao,
      shifadi: o.shifadi,
      mudedi: o.mudedi,
      jine: o.jine,
      zhuangtai: o.zhuangtai,
      chuangjian_shijian: o.chuangjian_shijian
    }))
  }
  chengke_detail_visible.value = true
}

// 删除乘客
async function delete_chengke(row: any) {
  try {
    await ElMessageBox.confirm(
      `确定要删除乘客 "${row.xingming}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = chengke_list.value.findIndex((item: any) => item.id === row.id)
    if (index > -1) {
      chengke_list.value.splice(index, 1)
      localStorage.setItem('chengke_list', JSON.stringify(chengke_list.value))
      ElMessage.success('删除成功')
      
      // 记录操作日志
      log_caozuo('user' as CaozuoType, '删除乘客', `删除乘客：${row.xingming}`)
    }
  } catch {
    // 用户取消
  }
}

// 获取订单状态标签
function get_status_label(status: number) {
  const labels: Record<number, string> = {
    0: '待指派',
    1: '已指派',
    2: '已拒单',
    3: '已接单',
    4: '进行中',
    5: '已完成',
    6: '已取消'
  }
  return labels[status] || '未知'
}
</script>

<style scoped>
.users-page { padding: 0; }
.table-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
.stat-value { font-size: 28px; font-weight: bold; margin-bottom: 8px; }
.stat-label { font-size: 14px; opacity: 0.9; }
.siji-detail-content { max-height: 70vh; overflow-y: auto; }
.custom-tag { font-size: 12px; color: #67c23a; margin-left: 5px; }
.default-tag { font-size: 12px; color: #909399; margin-left: 5px; }
.tip-text { font-size: 12px; color: #909399; margin-left: 10px; }
</style>
