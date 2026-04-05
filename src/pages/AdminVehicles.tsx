/**
 * 后台管理系统 - 车辆管理页面
 */

import React, { useState, useEffect } from 'react';

interface Vehicle {
  id: number;
  plate_number: string;
  type: 'suv' | 'business';
  brand_model: string;
  seats: number;
  color: string;
  daily_price: number;
  driver_id: number | null;
  images: string[];
  is_available: boolean;
  maintenance_note: string;
  driver_name?: string;
  driver_phone?: string;
  created_at: string;
  updated_at: string;
}

interface Driver {
  id: number;
  name: string;
  phone: string;
}

export const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // 加载车辆和司机列表
  useEffect(() => {
    loadVehicles();
    loadDrivers();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/vehicles', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setVehicles(data.data);
      } else {
        alert('加载车辆失败：' + data.error);
      }
    } catch (error) {
      console.error('加载车辆失败:', error);
      alert('加载车辆失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
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
        console.error('加载司机失败：', data.error);
      }
    } catch (error) {
      console.error('加载司机失败:', error);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingVehicle) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      let response;
      
      // 准备提交数据
      const submitData = {
        ...editingVehicle,
        images: editingVehicle.images || []
      };
      
      if (editingVehicle.id) {
        // 更新车辆
        response = await fetch(`/api/admin/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        });
      } else {
        // 创建车辆
        response = await fetch('/api/admin/vehicles', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        });
      }
      
      const data = await response.json();
      
      if (data.success) {
        alert(editingVehicle.id ? '车辆信息已更新' : '车辆创建成功');
        setShowForm(false);
        setEditingVehicle(null);
        setImageFiles([]); // 清空上传的图片
        loadVehicles(); // 重新加载列表
      } else {
        alert('操作失败：' + data.error);
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 删除车辆
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该车辆吗？此操作不可恢复！')) return;
    
    try {
      const response = await fetch(`/api/admin/vehicles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        alert('车辆已删除');
        loadVehicles(); // 重新加载列表
      } else {
        alert('删除失败：' + data.error);
      }
    } catch (error) {
      alert('删除失败，请重试');
    }
  };

  // 编辑车辆
  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
    setImageFiles([]); // 清空之前的上传文件
  };

  // 新增车辆
  const handleAdd = () => {
    setEditingVehicle({
      plate_number: '',
      type: 'suv',
      brand_model: '',
      seats: 5,
      color: '',
      daily_price: 0,
      driver_id: null,
      images: [],
      is_available: true,
      maintenance_note: ''
    });
    setShowForm(true);
    setImageFiles([]);
  };

  // 处理表单变化
  const handleInputChange = (field: keyof Vehicle, value: any) => {
    if (editingVehicle) {
      setEditingVehicle({
        ...editingVehicle,
        [field]: value
      });
    }
  };

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingVehicle) return;

    const newFiles = Array.from(files);
    setUploading(true);
    
    try {
      for (const file of newFiles) {
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
          // 添加到当前图片列表
          const currentImages = editingVehicle.images || [];
          handleInputChange('images', [...currentImages, data.data.url]);
        } else {
          alert(`上传失败：${data.error}`);
        }
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    if (editingVehicle && editingVehicle.images) {
      const newImages = [...editingVehicle.images];
      newImages.splice(index, 1);
      handleInputChange('images', newImages);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">车辆管理</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
        >
          + 新增车辆
        </button>
      </div>

      {showForm && editingVehicle && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-bold text-black mb-4">
            {editingVehicle.id ? '编辑车辆' : '新增车辆'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">车牌号 *</label>
              <input
                type="text"
                value={editingVehicle.plate_number || ''}
                onChange={(e) => handleInputChange('plate_number', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">车型 *</label>
              <select
                value={editingVehicle.type || 'suv'}
                onChange={(e) => handleInputChange('type', e.target.value as 'suv' | 'business')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
              >
                <option value="suv">SUV</option>
                <option value="business">商务车</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">品牌型号 *</label>
              <input
                type="text"
                value={editingVehicle.brand_model || ''}
                onChange={(e) => handleInputChange('brand_model', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">座位数 *</label>
              <input
                type="number"
                value={editingVehicle.seats || 5}
                onChange={(e) => handleInputChange('seats', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                min="2"
                max="10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">颜色</label>
              <input
                type="text"
                value={editingVehicle.color || ''}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">日租金 *</label>
              <input
                type="number"
                value={editingVehicle.daily_price || 0}
                onChange={(e) => handleInputChange('daily_price', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                min="0"
                step="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">关联司机</label>
              <select
                value={editingVehicle.driver_id || ''}
                onChange={(e) => handleInputChange('driver_id', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              >
                <option value="">请选择司机</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} ({driver.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">车辆照片</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {(editingVehicle.images || []).map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`车辆-${index + 1}`} 
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-black transition-colors flex flex-col items-center justify-center h-24">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <span className="text-xs text-gray-500">上传中...</span>
                  ) : (
                    <>
                      <span className="text-xl text-gray-400">+</span>
                      <span className="text-xs text-gray-500 mt-1">点击上传</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">维护备注</label>
              <textarea
                value={editingVehicle.maintenance_note || ''}
                onChange={(e) => handleInputChange('maintenance_note', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                rows={2}
                placeholder="例如：定期保养、故障维修等"
              />
            </div>

            <div className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                id="isAvailable"
                checked={!!editingVehicle.is_available}
                onChange={(e) => handleInputChange('is_available', e.target.checked)}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                是否可用
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingVehicle(null);
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车牌号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品牌型号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">座位数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日租金</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">司机</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vehicle.plate_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.type === 'suv' ? 'SUV' : '商务车'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.brand_model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.seats}座
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ¥{vehicle.daily_price}/天
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.driver_name ? `${vehicle.driver_name} (${vehicle.driver_phone})` : '未关联'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      vehicle.is_available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.is_available ? '可用' : '不可用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {vehicles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无车辆数据，点击"新增车辆"添加
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;
