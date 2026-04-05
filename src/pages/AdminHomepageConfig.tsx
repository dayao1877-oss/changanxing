/**
 * 后台管理系统 - 首页配置页面
 */

import React, { useState, useEffect } from 'react';

interface HomepageConfig {
  backgroundImages: string[];
  title: string;
  subtitle: string;
  showSubtitle: boolean;
  serviceCards: Array<{
    type: string;
    icon: string;
    title: string;
    subtitle: string;
    visible: boolean;
  }>;
}

export const AdminHomepageConfig = () => {
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/configs/homepage');
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload/image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success && config) {
        setConfig({
          ...config,
          backgroundImages: [...config.backgroundImages, data.data.url]
        });
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
    if (config) {
      setConfig({
        ...config,
        backgroundImages: config.backgroundImages.filter((_, i) => i !== index)
      });
    }
  };

  // 保存配置
  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/configs/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      if (data.success) {
        alert('配置已保存！');
      } else {
        alert('保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 更新服务卡片
  const updateServiceCard = (index: number, field: string, value: any) => {
    if (config) {
      const newCards = [...config.serviceCards];
      newCards[index] = { ...newCards[index], [field]: value };
      setConfig({ ...config, serviceCards: newCards });
    }
  };

  if (!config) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-black mb-6">首页配置</h1>

      {/* 背景图管理 */}
      <section className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-black mb-4">背景图片</h2>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          {config.backgroundImages.map((url, index) => (
            <div key={index} className="relative group">
              <img 
                src={url} 
                alt={`背景${index + 1}`} 
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
          
          <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-black transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <span className="text-gray-500">上传中...</span>
            ) : (
              <>
                <span className="text-2xl text-gray-400">+</span>
                <p className="text-xs text-gray-500 mt-2">上传图片</p>
              </>
            )}
          </label>
        </div>

        <p className="text-xs text-gray-500">
          建议尺寸：1920x1080px，支持 JPG/PNG 格式，最大 10MB
        </p>
      </section>

      {/* 标题配置 */}
      <section className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-black mb-4">标题设置</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主标题
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              副标题
            </label>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showSubtitle"
              checked={config.showSubtitle}
              onChange={(e) => setConfig({ ...config, showSubtitle: e.target.checked })}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
            />
            <label htmlFor="showSubtitle" className="ml-2 text-sm text-gray-700">
              显示副标题
            </label>
          </div>
        </div>
      </section>

      {/* 服务卡片配置 */}
      <section className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-black mb-4">服务卡片</h2>
        
        <div className="space-y-4">
          {config.serviceCards.map((card, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-black">{card.title}</h3>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={card.visible}
                    onChange={(e) => updateServiceCard(index, 'visible', e.target.checked)}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="ml-2 text-gray-600">显示</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">标题</label>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => updateServiceCard(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">副标题</label>
                  <input
                    type="text"
                    value={card.subtitle}
                    onChange={(e) => updateServiceCard(index, 'subtitle', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 保存按钮 */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={loadConfig}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
        >
          重置
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-3 bg-black text-white font-bold rounded-lg uppercase tracking-widest hover:bg-gray-800 transition-colors ${
            saving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {saving ? '保存中...' : '保存配置'}
        </button>
      </div>
    </div>
  );
};

export default AdminHomepageConfig;
