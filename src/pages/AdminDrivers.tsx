/**
 * 后台管理系统 - 司机管理页面
 */

import React, { useState, useEffect } from 'react';

interface Driver {
  id: number;
  name: string;
  phone: string;
  wechat: string;
  experience_years: number;
  description: string;
  avatar_url: string;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const AdminDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Partial<Driver> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 加载司机列表
  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/drivers', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setDrivers(data.data);
      } else {
        alert('加载失败：' + data.error);
      }
    } catch (error) {
      console.error('加载失败:', error);
      alert('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingDriver) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      let response;
      
      if (editingDriver.id) {
        // 更新司机
        response = await fetch(`/api/admin/drivers/${editingDriver.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editingDriver)
        });
      } else {
        // 创建司机
        response = await fetch('/api/admin/drivers', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editingDriver)
        });
      }
      
      const data = await response.json();
      
      if (data.success) {
        alert(editingDriver.id ? '司机信息已更新' : '司机创建成功');
        setShowForm(false);
        setEditingDriver(null);
        loadDrivers(); // 重新加载列表
      } else {
        alert('操作失败：' + data.error);
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 删除司机
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该司机吗？此操作不可恢复！')) return;
    
    try {
      const response = await fetch(`/api/admin/drivers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        alert('司机已删除');
        loadDrivers(); // 重新加载列表
      } else {
        alert('删除失败：' + data.error);
      }
    } catch (error) {
      alert('删除失败，请重试');
    }
  };

  // 编辑司机
  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setShowForm(true);
  };

  // 新增司机
  const handleAdd = () => {
    setEditingDriver({
      name: '',
      phone: '',
      wechat: '',
      experience_years: 0,
      description: '',
      avatar_url: '',
      is_visible: true,
      sort_order: 0
    });
    setShowForm(true);
  };

  // 处理表单变化
  const handleInputChange = (field: keyof Driver, value: any) => {
    if (editingDriver) {
      setEditingDriver({
        ...editingDriver,
        [field]: value
      });
    }
  };

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingDriver) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        handleInputChange('avatar_url', data.data.url);
      } else {
        alert('上传失败：' + data.error);
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">司机管理</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
        >
          + 新增司机
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-bold text-black mb-4">
            {editingDriver?.id ? '编辑司机' : '新增司机'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
              <input
                type="text"
                value={editingDriver?.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">电话 *</label>
              <input
                type="tel"
                value={editingDriver?.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">微信</label>
              <input
                type="text"
                value={editingDriver?.wechat || ''}
                onChange={(e) => handleInputChange('wechat', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">驾龄</label>
              <input
                type="number"
                value={editingDriver?.experience_years || 0}
                onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                min="0"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">头像</label>
              <div className="flex items-center space-x-4">
                {editingDriver?.avatar_url && (
                  <img 
                    src={editingDriver.avatar_url} 
                    alt="预览" 
                    className="w-16 h-16 rounded-full object-cover border border-gray-200"
                  />
                )}
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-black transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <span className="text-sm text-gray-500">上传中...</span>
                  ) : (
                    <span className="text-sm text-gray-500">点击上传</span>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">排序</label>
              <input
                type="number"
                value={editingDriver?.sort_order || 0}
                onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">个人介绍</label>
              <textarea
                value={editingDriver?.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                rows={3}
              />
            </div>

            <div className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                id="isVisible"
                checked={!!editingDriver?.is_visible}
                onChange={(e) => handleInputChange('is_visible', e.target.checked)}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <label htmlFor="isVisible" className="ml-2 text-sm text-gray-700">
                是否显示
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingDriver(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">头像</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电话</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">微信</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">驾龄</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src={driver.avatar_url || '/images/default-avatar.png'} 
                      alt={driver.name} 
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {driver.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.wechat}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.experience_years}年
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      driver.is_visible 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {driver.is_visible ? '显示' : '隐藏'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(driver)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {drivers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无司机数据，点击"新增司机"添加
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDrivers;
