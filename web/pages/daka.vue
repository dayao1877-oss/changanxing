<template>
  <Layout>
    <div class="daka-page">
      <el-card>
        <el-table :data="daka_list" style="width: 100%;">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="dingdan" label="订单号" width="150" />
          <el-table-column prop="siji" label="司机" width="120" />
          <el-table-column prop="leixing" label="打卡类型" width="120">
            <template #default="{ row }">
              <el-tag :type="get_type_color(row.leixing)">
                {{ get_type_label(row.leixing) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="dizhi" label="打卡地点" />
          <el-table-column prop="shijian" label="时间" width="170" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="view_photo(row)">查看照片</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import Layout from '~/components/Layout.vue'

const daka_list = ref([
  { id: 1, dingdan: 'DD20240424001', siji: '王师傅', leixing: 1, dizhi: '火车站', shijian: '2024-04-24 10:30:00' },
  { id: 2, dingdan: 'DD20240424001', siji: '王师傅', leixing: 3, dizhi: '机场', shijian: '2024-04-24 11:15:00' }
])

function get_type_color(type: number) {
  const map: Record<number, any> = { 1: 'primary', 2: 'info', 3: 'success' }
  return map[type] || 'info'
}
function get_type_label(type: number) {
  const map: Record<number, string> = { 1: '始发地', 2: '途经点', 3: '目的地' }
  return map[type] || '未知'
}

function view_photo(row: any) {
  ElMessage.info(`查看打卡照片：${row.dingdan}`)
}
</script>
<style scoped>.daka-page { padding: 0; }</style>
