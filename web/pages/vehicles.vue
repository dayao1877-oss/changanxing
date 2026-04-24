<template>
  <Layout>
    <div class="vehicles-page">
      <el-card>
        <div class="table-toolbar">
          <el-button type="primary" @click="open_vehicle_dialog()">
            <el-icon><Plus /></el-icon> 添加车辆
          </el-button>
          <el-input v-model="search_keyword" placeholder="搜索车牌号" clearable style="width: 300px;" />
        </div>
        <el-table :data="vehicle_list" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="chepai" label="车牌号" width="150" />
          <el-table-column prop="chexing" label="车型" width="150" />
          <el-table-column prop="siji" label="绑定司机" width="120" />
          <el-table-column prop="zhuangtai" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.zhuangtai === 1 ? 'success' : 'danger'">
                {{ row.zhuangtai === 1 ? '可用' : '不可用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280">
            <template #default="{ row }">
              <el-button size="small" @click="edit_vehicle(row)">编辑</el-button>
              <el-button size="small" type="warning" @click="bind_siji(row)">绑定司机</el-button>
              <el-button size="small" type="danger" @click="delete_vehicle(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'

const search_keyword = ref('')

const vehicle_list = ref([
  { id: 1, chepai: '京A12345', chexing: '大众帕萨特', siji: '王师傅', zhuangtai: 1 },
  { id: 2, chepai: '京B23456', chexing: '丰田凯美瑞', siji: '赵师傅', zhuangtai: 1 },
  { id: 3, chepai: '京C34567', chexing: '别克君威', siji: '', zhuangtai: 0 }
])

function open_vehicle_dialog() {
  ElMessage.success('添加车辆功能')
}

function edit_vehicle(row: any) {
  ElMessage.info(`编辑车辆：${row.chepai}`)
}

function bind_siji(row: any) {
  ElMessage.info(`绑定司机到车辆：${row.chepai}`)
}

async function delete_vehicle(row: any) {
  try {
    await ElMessageBox.confirm(
      `确定要删除车辆 "${row.chepai}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const index = vehicle_list.value.findIndex((item: any) => item.id === row.id)
    if (index > -1) {
      vehicle_list.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.vehicles-page {
  padding: 0;
}
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
