<template>
  <Layout>
    <div class="tuisong-page">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>消息推送管理</span>
            <el-button type="primary" @click="open_send_dialog">
              <el-icon><Plus /></el-icon> 发送公告
            </el-button>
          </div>
        </template>

        <el-tabs v-model="active_tab">
          <el-tab-pane label="系统公告" name="gonggao">
            <el-table :data="gonggao_list" style="width: 100%;">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="biaoti" label="标题" />
              <el-table-column prop="neirong" label="内容" show-overflow-tooltip />
              <el-table-column prop="fanwei" label="推送范围" width="120">
                <template #default="{ row }">
                  <el-tag>{{ row.fanwei === 'all' ? '全部' : row.fanwei === 'siji' ? '司机' : '乘客' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="shijian" label="发布时间" width="170" />
              <el-table-column prop="zhuangtai" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.zhuangtai === 1 ? 'success' : 'info'">
                    {{ row.zhuangtai === 1 ? '已发送' : '草稿' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button size="small" type="primary" @click="view_gonggao(row)">查看</el-button>
                  <el-button size="small" type="danger" @click="delete_gonggao(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="推送历史" name="lishi">
            <el-table :data="tuisong_lishi" style="width: 100%;">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="biaoti" label="标题" />
              <el-table-column prop="mubiao" label="推送目标" width="120" />
              <el-table-column prop="shijian" label="推送时间" width="170" />
              <el-table-column prop="jieguo" label="结果" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.jieguo === 'success' ? 'success' : 'danger'">
                    {{ row.jieguo === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="消息模板" name="moban">
            <div class="moban-actions">
              <el-button type="primary" @click="open_moban_dialog()">
                <el-icon><Plus /></el-icon> 添加模板
              </el-button>
            </div>
            <el-table :data="moban_list" style="width: 100%; margin-top: 20px;">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="mingcheng" label="模板名称" />
              <el-table-column prop="neirong" label="模板内容" show-overflow-tooltip />
              <el-table-column prop="leixing" label="类型" width="120" />
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button size="small" @click="open_moban_dialog(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="delete_moban(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 发送公告弹窗 -->
      <el-dialog title="发送系统公告" v-model="send_dialog_visible" width="600px">
        <el-form :model="send_form" label-width="100px">
          <el-form-item label="公告标题">
            <el-input v-model="send_form.biaoti" placeholder="请输入公告标题" />
          </el-form-item>
          <el-form-item label="公告内容">
            <el-input v-model="send_form.neirong" type="textarea" :rows="5" placeholder="请输入公告内容" />
          </el-form-item>
          <el-form-item label="推送范围">
            <el-radio-group v-model="send_form.fanwei">
              <el-radio-button label="all">全部用户</el-radio-button>
              <el-radio-button label="siji">司机</el-radio-button>
              <el-radio-button label="chengke">乘客</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="使用模板">
            <el-select v-model="send_form.moban_id" placeholder="选择模板（选填）" clearable style="width: 100%;">
              <el-option v-for="moban in moban_list" :key="moban.id" :label="moban.mingcheng" :value="moban.id" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="send_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="execute_send">发送</el-button>
        </template>
      </el-dialog>

      <!-- 模板编辑弹窗 -->
      <el-dialog :title="current_moban.id ? '编辑模板' : '添加模板'" v-model="moban_dialog_visible" width="500px">
        <el-form :model="current_moban" label-width="100px">
          <el-form-item label="模板名称">
            <el-input v-model="current_moban.mingcheng" placeholder="请输入模板名称" />
          </el-form-item>
          <el-form-item label="模板类型">
            <el-select v-model="current_moban.leixing" placeholder="请选择类型" style="width: 100%;">
              <el-option label="系统公告" value="gonggao" />
              <el-option label="订单通知" value="dingdan" />
              <el-option label="紧急通知" value="jinji" />
            </el-select>
          </el-form-item>
          <el-form-item label="模板内容">
            <el-input v-model="current_moban.neirong" type="textarea" :rows="5" placeholder="请输入模板内容，可用变量：{name}、{order}、{time}" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="moban_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="save_moban">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'
import { add_caozuo_log } from '~/utils/caozuo-log'

const active_tab = ref('gonggao')
const send_dialog_visible = ref(false)
const moban_dialog_visible = ref(false)

const gonggao_list = ref<any[]>([])
const tuisong_lishi = ref<any[]>([])
const moban_list = ref<any[]>([])

const send_form = ref({
  biaoti: '',
  neirong: '',
  fanwei: 'all',
  moban_id: null as number | null
})

const current_moban = ref({
  id: null as number | null,
  mingcheng: '',
  leixing: 'gonggao',
  neirong: ''
})

// 加载数据
function load_data() {
  const gonggao = localStorage.getItem('gonggao_list')
  if (gonggao) gonggao_list.value = JSON.parse(gonggao)

  const lishi = localStorage.getItem('tuisong_lishi')
  if (lishi) tuisong_lishi.value = JSON.parse(lishi)

  const moban = localStorage.getItem('moban_list')
  if (moban) {
    moban_list.value = JSON.parse(moban)
  } else {
    // 默认模板
    moban_list.value = [
      { id: 1, mingcheng: '订单指派通知', leixing: 'dingdan', neirong: '您有新的订单{order}待接单，请尽快处理。' },
      { id: 2, mingcheng: '系统维护公告', leixing: 'gonggao', neirong: '系统将于{time}进行维护，请提前做好准备。' }
    ]
    localStorage.setItem('moban_list', JSON.stringify(moban_list.value))
  }
}

// 监听模板选择
watch(() => send_form.value.moban_id, (val) => {
  if (val) {
    const moban = moban_list.value.find(m => m.id === val)
    if (moban) {
      send_form.value.neirong = moban.neirong
    }
  }
})

function open_send_dialog() {
  send_form.value = { biaoti: '', neirong: '', fanwei: 'all', moban_id: null }
  send_dialog_visible.value = true
}

function execute_send() {
  if (!send_form.value.biaoti || !send_form.value.neirong) {
    ElMessage.warning('请填写完整信息')
    return
  }

  // 创建公告
  const gonggao = {
    id: Date.now(),
    biaoti: send_form.value.biaoti,
    neirong: send_form.value.neirong,
    fanwei: send_form.value.fanwei,
    shijian: new Date().toLocaleString(),
    zhuangtai: 1
  }

  gonggao_list.value.unshift(gonggao)
  localStorage.setItem('gonggao_list', JSON.stringify(gonggao_list.value))

  // 记录推送历史
  const lishi = {
    id: Date.now(),
    biaoti: send_form.value.biaoti,
    mubiao: send_form.value.fanwei === 'all' ? '全部用户' : send_form.value.fanwei === 'siji' ? '司机' : '乘客',
    shijian: new Date().toLocaleString(),
    jieguo: 'success'
  }

  tuisong_lishi.value.unshift(lishi)
  localStorage.setItem('tuisong_lishi', JSON.stringify(tuisong_lishi.value))

  send_dialog_visible.value = false
  ElMessage.success('公告发送成功')

  // 记录操作日志
  add_caozuo_log({
    caozuoren: '管理员',
    mokuai: '消息推送',
    type: 'other',
    biaoti: '发送系统公告',
    neirong: `标题：${send_form.value.biaoti}，范围：${lishi.mubiao}`
  })
}

function view_gonggao(row: any) {
  ElMessageBox.alert(row.neirong, row.biaoti, { confirmButtonText: '确定' })
}

async function delete_gonggao(row: any) {
  try {
    await ElMessageBox.confirm('确定删除此公告吗？', '提示', { type: 'warning' })
    const index = gonggao_list.value.findIndex(g => g.id === row.id)
    if (index > -1) {
      gonggao_list.value.splice(index, 1)
      localStorage.setItem('gonggao_list', JSON.stringify(gonggao_list.value))
      ElMessage.success('删除成功')
    }
  } catch {}
}

function open_moban_dialog(row?: any) {
  if (row) {
    current_moban.value = { ...row }
  } else {
    current_moban.value = { id: null, mingcheng: '', leixing: 'gonggao', neirong: '' }
  }
  moban_dialog_visible.value = true
}

function save_moban() {
  if (!current_moban.value.mingcheng || !current_moban.value.neirong) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (current_moban.value.id) {
    const index = moban_list.value.findIndex(m => m.id === current_moban.value.id)
    if (index > -1) {
      moban_list.value[index] = { ...current_moban.value }
    }
  } else {
    const new_id = moban_list.value.length > 0 ? Math.max(...moban_list.value.map(m => m.id)) + 1 : 1
    moban_list.value.push({ ...current_moban.value, id: new_id })
  }

  localStorage.setItem('moban_list', JSON.stringify(moban_list.value))
  moban_dialog_visible.value = false
  ElMessage.success('保存成功')
}

async function delete_moban(row: any) {
  try {
    await ElMessageBox.confirm('确定删除此模板吗？', '提示', { type: 'warning' })
    const index = moban_list.value.findIndex(m => m.id === row.id)
    if (index > -1) {
      moban_list.value.splice(index, 1)
      localStorage.setItem('moban_list', JSON.stringify(moban_list.value))
      ElMessage.success('删除成功')
    }
  } catch {}
}

onMounted(() => {
  load_data()
})
</script>

<style scoped>
.tuisong-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.moban-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
