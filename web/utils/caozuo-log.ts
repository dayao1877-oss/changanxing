// 全局操作日志工具

// 操作类型
export type CaozuoType = 
  | 'order'      // 订单操作
  | 'user'       // 用户管理
  | 'vehicle'    // 车辆管理
  | 'caiwu'      // 财务管理
  | 'jifei'      // 计费规则
  | 'ticheng'    // 提成设置
  | 'xitong'     // 系统配置
  | 'daochu'     // 数据导出
  | 'chushihua'  // 系统初始化
  | 'login'      // 登录
  | 'other'      // 其他

// 操作日志数据结构
export interface CaozuoLog {
  id: number
  caozuoren: string
  mokuai: string
  type: CaozuoType
  biaoti: string
  neirong: string
  shijian: string
  ip?: string
  detail?: any  // 详细数据，用于记录变更前后的值
}

// 添加操作日志
export function add_caozuo_log(log: Omit<CaozuoLog, 'id' | 'shijian'>) {
  const key = 'caozuo_logs'
  const logs: CaozuoLog[] = JSON.parse(localStorage.getItem(key) || '[]')
  
  const new_log: CaozuoLog = {
    ...log,
    id: Date.now(),
    shijian: new Date().toLocaleString()
  }
  
  logs.unshift(new_log)
  
  // 只保留最近1000条日志
  if (logs.length > 1000) {
    logs.splice(1000)
  }
  
  localStorage.setItem(key, JSON.stringify(logs))
}

// 获取操作日志
export function get_caozuo_logs(type?: CaozuoType, limit: number = 100): CaozuoLog[] {
  const logs: CaozuoLog[] = JSON.parse(localStorage.getItem('caozuo_logs') || '[]')
  
  if (type) {
    return logs.filter(log => log.type === type).slice(0, limit)
  }
  
  return logs.slice(0, limit)
}

// 获取当前操作人（从登录信息）
export function get_caozuoren(): string {
  const auth = localStorage.getItem('auth')
  if (auth) {
    const user = JSON.parse(auth)
    return user.sj_xingming || user.username || '管理员'
  }
  return '管理员'
}

// 记录配置变更（对比前后值）
export function log_config_change(
  mokuai: string,
  type: CaozuoType,
  biaoti: string,
  old_value: any,
  new_value: any
) {
  const changes: string[] = []
  
  for (const key in new_value) {
    if (old_value[key] !== new_value[key]) {
      const old_val = old_value[key] ?? '未设置'
      const new_val = new_value[key] ?? '未设置'
      changes.push(`${key}: ${old_val} → ${new_val}`)
    }
  }
  
  add_caozuo_log({
    caozuoren: get_caozuoren(),
    mokuai,
    type,
    biaoti,
    neirong: changes.length > 0 ? changes.join('；') : '无变更',
    detail: { old_value, new_value }
  })
}

// 记录订单操作
export function log_order_action(dingdanhao: string, action: string, detail?: string) {
  add_caozuo_log({
    caozuoren: get_caozuoren(),
    mokuai: '订单管理',
    type: 'order',
    biaoti: `订单${action}`,
    neirong: `订单号：${dingdanhao}${detail ? '，' + detail : ''}`
  })
}

// 记录用户管理操作
export function log_user_action(action: string, target: string, detail?: string) {
  add_caozuo_log({
    caozuoren: get_caozuoren(),
    mokuai: '用户管理',
    type: 'user',
    biaoti: action,
    neirong: `${target}${detail ? '，' + detail : ''}`
  })
}

// 记录财务管理操作
export function log_caiwu_action(action: string, jine: string, detail?: string) {
  add_caozuo_log({
    caozuoren: get_caozuoren(),
    mokuai: '财务管理',
    type: 'caiwu',
    biaoti: action,
    neirong: `金额：${jine}${detail ? '，' + detail : ''}`
  })
}

// 记录计费规则变更
export function log_jifei_change(old_config: any, new_config: any) {
  log_config_change('计费规则', 'jifei', '修改计费规则', old_config, new_config)
}

// 记录提成设置变更
export function log_ticheng_change(siji_name: string, old_bili: number | null, new_bili: number | null) {
  add_caozuo_log({
    caozuoren: get_caozuoren(),
    mokuai: '司机管理',
    type: 'ticheng',
    biaoti: '设置司机提成比例',
    neirong: `司机：${siji_name}，提成比例：${old_bili ?? '默认'}% → ${new_bili ?? '默认'}%`
  })
}

// 记录系统配置变更
export function log_xitong_change(old_config: any, new_config: any) {
  log_config_change('系统配置', 'xitong', '修改系统配置', old_config, new_config)
}

// 记录数据导出
export function log_daochu_action(daochu_type: string, count: number) {
  add_caozuo_log({
    caozuoren: get_caozuoren(),
    mokuai: '数据导出',
    type: 'daochu',
    biaoti: '导出数据',
    neirong: `导出类型：${daochu_type}，导出数量：${count}条`
  })
}

// 记录系统初始化
export function log_chushihua_action(init_type: string) {
  add_caozuo_log({
    caozuoren: get_caozuoren(),
    mokuai: '系统初始化',
    type: 'chushihua',
    biaoti: '执行系统初始化',
    neirong: `初始化类型：${init_type}，所有相关数据已清空`
  })
}

// 记录登录操作
export function log_login_action(username: string, success: boolean) {
  add_caozuo_log({
    caozuoren: username,
    mokuai: '系统登录',
    type: 'login',
    biaoti: success ? '登录成功' : '登录失败',
    neirong: success ? '用户成功登录系统' : '登录失败，请检查用户名和密码'
  })
}

// 通用操作记录函数
export function log_caozuo(type: CaozuoType, biaoti: string, neirong: string) {
  add_caozuo_log({
    caozuoren: get_caozuoren(),
    mokuai: get_mokuai_name(type),
    type,
    biaoti,
    neirong
  })
}

// 获取模块名称
function get_mokuai_name(type: CaozuoType): string {
  const names: Record<CaozuoType, string> = {
    order: '订单管理',
    user: '用户管理',
    vehicle: '车辆管理',
    caiwu: '财务管理',
    jifei: '计费规则',
    ticheng: '提成设置',
    xitong: '系统配置',
    daochu: '数据导出',
    chushihua: '系统初始化',
    login: '系统登录',
    other: '其他操作'
  }
  return names[type] || '其他'
}
