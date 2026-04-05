# 前端工程师工作任务单

**优先级**: P0 - 紧急重要  
**截止时间**: 今天下午 18:00  
**状态**: 🔴 进行中 (60%)

---

## 📋 任务清单

### 1. 路由配置和布局组件

**当前进度**: 70%  
**需要完成**:

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 前台路由 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        
        {/* 后台管理路由 */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="homepage" element={<AdminHomepageConfig />} />
          <Route path="drivers" element={<AdminDrivers />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

**产出物**: 
- ✅ `src/App.tsx` (更新)
- ⏳ `src/layouts/AdminLayout.tsx`

---

### 2. 路由守卫组件

**当前进度**: 0%  
**需要实现**:

```typescript
// src/components/AdminRoute.tsx
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

// 使用示例
<Route path="/admin/drivers" element={
  <AdminRoute>
    <AdminDrivers />
  </AdminRoute>
} />
```

**产出物**: `src/components/AdminRoute.tsx`

---

### 3. 司机管理界面

**当前进度**: 40%  
**需要实现**:

**界面布局**:
```tsx
// src/pages/AdminDrivers.tsx
export const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  
  // 加载司机列表
  const loadDrivers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/drivers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setDrivers(data.data);
      }
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 删除司机
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该司机吗？')) return;
    
    try {
      const response = await fetch(`/api/admin/drivers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      
      const data = await response.json();
      if (data.success) {
        alert('删除成功');
        loadDrivers();
      } else {
        alert('删除失败：' + data.error);
      }
    } catch (error) {
      alert('删除失败');
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">司机管理</h1>
      
      {/* 司机列表表格 */}
      <table className="w-full border-collapse bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">头像</th>
            <th className="p-3 text-left">姓名</th>
            <th className="p-3 text-left">电话</th>
            <th className="p-3 text-left">微信</th>
            <th className="p-3 text-left">驾龄</th>
            <th className="p-3 text-left">状态</th>
            <th className="p-3 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map(driver => (
            <tr key={driver.id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <img src={driver.avatar_url} alt={driver.name} className="w-12 h-12 rounded-full" />
              </td>
              <td className="p-3">{driver.name}</td>
              <td className="p-3">{driver.phone}</td>
              <td className="p-3">{driver.wechat}</td>
              <td className="p-3">{driver.experience_years}年</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs ${
                  driver.is_visible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {driver.is_visible ? '显示中' : '已隐藏'}
                </span>
              </td>
              <td className="p-3 space-x-2">
                <button onClick={() => setEditingDriver(driver)} className="text-blue-600 hover:underline">编辑</button>
                <button onClick={() => handleDelete(driver.id)} className="text-red-600 hover:underline">删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

**产出物**: `src/pages/AdminDrivers.tsx`

---

### 4. 车辆管理界面

**当前进度**: 30%  
**需要实现**:

类似司机管理界面，但字段不同：
- 车牌号
- 车型（SUV/商务车）
- 品牌型号
- 座位数
- 颜色
- 日租金
- 关联司机
- 车辆照片

**产出物**: `src/pages/AdminVehicles.tsx`

---

### 5. 订单列表页面

**当前进度**: 0%  
**需要实现**:

**功能**:
- 订单列表展示
- 筛选（按状态、日期、车型）
- 订单详情查看
- 订单状态修改
- 搜索功能

**产出物**: `src/pages/AdminOrders.tsx`

---

### 6. 档期日历组件

**当前进度**: 0%  
**需要实现**:

**功能**:
- 月视图日历
- 日期状态显示（绿色=可订/红色=已订/灰色=休息）
- 点击日期查看详情
- 批量设置日期状态

**技术选型**:
- react-calendar (轻量级)
- fullcalendar (功能强大)
- 或自己实现简单版本

**产出物**: `src/components/ScheduleCalendar.tsx`

---

## ⏰ 时间安排

**上午** (9:00-12:00):
- [x] 路由配置 (70%)
- [ ] AdminLayout 布局组件
- [ ] 路由守卫组件
- [ ] 司机管理界面 (剩余部分)

**下午** (14:00-18:00):
- [ ] 车辆管理界面 (14:00-15:30)
- [ ] 订单列表页面 (15:30-16:30)
- [ ] 档期日历组件 (16:30-17:30)
- [ ] 整合测试 (17:30-18:00)

---

## 🎨 UI 设计规范

### 颜色方案
```css
/* 主色调 */
--primary: #000000;        /* 黑色 */
--secondary: #6B7280;      /* 灰色 */
--success: #10B981;        /* 绿色 */
--danger: #EF4444;         /* 红色 */
--warning: #F59E0B;        /* 黄色 */
```

### 间距规范
```css
/* 统一使用 Tailwind 的 spacing scale */
p-2 = 0.5rem (8px)
p-4 = 1rem (16px)
p-6 = 1.5rem (24px)
p-8 = 2rem (32px)
```

### 字体大小
```css
text-xs = 0.75rem (12px)
text-sm = 0.875rem (14px)
text-base = 1rem (16px)
text-lg = 1.125rem (18px)
text-xl = 1.25rem (20px)
text-2xl = 1.5rem (24px)
```

---

## 📞 需要协作的成员

- @后端工程师：API 接口格式确认
- @UI 设计师：界面风格是否统一？
- @产品经理：交互流程是否符合预期？

---

## ✅ 交付标准

1. ✅ 所有页面响应式（支持电脑和手机）
2. ✅ 代码有完整的 TypeScript 类型定义
3. ✅ 错误处理完善（网络错误、验证错误）
4. ✅ Loading 状态友好提示
5. ✅ 表单验证完整
6. ✅ 与后端 API 联调通过

---

**负责人**: 前端工程师  
**监督人**: 项目经理  
**最后更新**: 2026-03-23 11:30
