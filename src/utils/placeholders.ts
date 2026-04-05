/**
 * 占位图配置
 * 用于在真实素材提供前临时使用
 */

export const PLACEHOLDER_IMAGES = {
  // 司机形象照占位
  drivers: {
    yao: 'https://ui-avatars.com/api/?name=姚&size=400&background=1E3A8A&color=fff&font-size=0.5',
    wang: 'https://ui-avatars.com/api/?name=王&size=400&background=C41E3A&color=fff&font-size=0.5'
  },

  // 车辆照片占位（使用 Unsplash 随机汽车图片）
  vehicles: {
    suv: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop'
    ],
    business: [
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop'
    ]
  },

  // 摄影作品占位（使用 Picsum 旅行主题）
  portfolio: [
    'https://picsum.photos/seed/xian1/800/600',
    'https://picsum.photos/seed/xian2/800/600',
    'https://picsum.photos/seed/xian3/800/600',
    'https://picsum.photos/seed/xian4/800/600',
    'https://picsum.photos/seed/xian5/800/600',
    'https://picsum.photos/seed/xian6/800/600',
    'https://picsum.photos/seed/xian7/800/600',
    'https://picsum.photos/seed/xian8/800/600',
    'https://picsum.photos/seed/xian9/800/600',
    'https://picsum.photos/seed/xian10/800/600'
  ]
};

/**
 * 获取司机头像 URL
 */
export function getDriverAvatar(driverName: string): string {
  if (driverName.includes('姚')) {
    return PLACEHOLDER_IMAGES.drivers.yao;
  }
  if (driverName.includes('王')) {
    return PLACEHOLDER_IMAGES.drivers.wang;
  }
  // 默认头像
  return 'https://ui-avatars.com/api/?name=司机&size=400&background=E5E7EB&color=374151';
}

/**
 * 获取车辆图片 URLs
 */
export function getVehicleImages(vehicleType: 'suv' | 'business'): string[] {
  return PLACEHOLDER_IMAGES.vehicles[vehicleType] || [];
}

/**
 * 获取作品集图片
 */
export function getPortfolioImages(count: number = 10): string[] {
  return PLACEHOLDER_IMAGES.portfolio.slice(0, count);
}

export default PLACEHOLDER_IMAGES;
