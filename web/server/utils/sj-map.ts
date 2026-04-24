import { ofetch } from 'ofetch'

/**
 * sj-map 地图服务工具函数
 * 集成高德地图 API
 */

// 从环境变量获取高德地图 API Key
const AMAP_KEY = process.env.AMAP_KEY || ''

/**
 * 地理编码：地址转经纬度
 */
export async function sjGeocode(sjAddress: string, sjCity?: string) {
  try {
    const sjUrl = 'https://restapi.amap.com/v3/geocode/geo'
    const sjParams: any = {
      key: AMAP_KEY,
      address: sjAddress
    }
    if (sjCity) {
      sjParams.city = sjCity
    }

    const sjResponse = await ofetch(sjUrl, {
      method: 'GET',
      query: sjParams
    })

    if (sjResponse.status === '1' && sjResponse.geocodes && sjResponse.geocodes.length > 0) {
      const sjLocation = sjResponse.geocodes[0].location
      const [sjJingdu, sjWeidu] = sjLocation.split(',')
      return {
        sj_code: 200,
        sj_message: '解析成功',
        sj_data: {
          sj_jingdu: parseFloat(sjJingdu),
          sj_weidu: parseFloat(sjWeidu),
          sj_formatted_address: sjResponse.geocodes[0].formatted_address || sjAddress
        }
      }
    } else {
      return {
        sj_code: 400,
        sj_message: sjResponse.info || '地址解析失败',
        sj_error: 'SJ-MAP-002'
      }
    }
  } catch (sjError) {
    console.error('sjGeocode 错误:', sjError)
    return {
      sj_code: 500,
      sj_message: '地图服务调用失败',
      sj_error: 'SJ-MAP-002'
    }
  }
}

/**
 * 逆地理编码：经纬度转地址
 */
export async function sjReverseGeocode(sjJingdu: string, sjWeidu: string) {
  try {
    const sjUrl = 'https://restapi.amap.com/v3/geocode/regeo'
    const sjParams = {
      key: AMAP_KEY,
      location: `${sjJingdu},${sjWeidu}`
    }

    const sjResponse = await ofetch(sjUrl, {
      method: 'GET',
      query: sjParams
    })

    if (sjResponse.status === '1' && sjResponse.regeocode) {
      return {
        sj_code: 200,
        sj_message: '解析成功',
        sj_data: {
          sj_formatted_address: sjResponse.regeocode.formatted_address,
          sj_address_component: sjResponse.regeocode.addressComponent
        }
      }
    } else {
      return {
        sj_code: 400,
        sj_message: sjResponse.info || '地址解析失败',
        sj_error: 'SJ-MAP-002'
      }
    }
  } catch (sjError) {
    console.error('sjReverseGeocode 错误:', sjError)
    return {
      sj_code: 500,
      sj_message: '地图服务调用失败',
      sj_error: 'SJ-MAP-002'
    }
  }
}

/**
 * 计算两点间直线距离 (Haversine 公式)
 */
export function sjCalculateStraightDistance(
  sjJingdu1: number,
  sjWeidu1: number,
  sjJingdu2: number,
  sjWeidu2: number
) {
  const R = 6371 // 地球半径 (公里)
  const dLat = (sjWeidu2 - sjWeidu1) * Math.PI / 180
  const dLon = (sjJingdu2 - sjJingdu1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(sjWeidu1 * Math.PI / 180) * Math.cos(sjWeidu2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const sjDistance = R * c // 距离 (公里)

  return {
    sj_code: 200,
    sj_message: '计算成功',
    sj_data: {
      sj_distance: sjDistance, // 公里
      sj_distance_meters: sjDistance * 1000 // 米
    }
  }
}

/**
 * 调用高德地图驾车距离计算
 */
export async function sjCalculateDrivingDistance(
  sjJingdu1: string,
  sjWeidu1: string,
  sjJingdu2: string,
  sjWeidu2: string
) {
  try {
    const sjUrl = 'https://restapi.amap.com/v3/direction/driving'
    const sjParams = {
      key: AMAP_KEY,
      origin: `${sjJingdu1},${sjWeidu1}`,
      destination: `${sjJingdu2},${sjWeidu2}`
    }

    const sjResponse = await ofetch(sjUrl, {
      method: 'GET',
      query: sjParams
    })

    if (sjResponse.status === '1' && sjResponse.route && sjResponse.route.paths && sjResponse.route.paths.length > 0) {
      const sjPath = sjResponse.route.paths[0]
      return {
        sj_code: 200,
        sj_message: '计算成功',
        sj_data: {
          sj_distance: sjPath.distance / 1000, // 公里
          sj_distance_meters: sjPath.distance, // 米
          sj_duration: sjPath.duration, // 秒
          sj_duration_text: `${Math.floor(sjPath.duration / 60)}分钟`
        }
      }
    } else {
      // 如果高德API失败，退回到直线距离计算
      return sjCalculateStraightDistance(
        parseFloat(sjJingdu1),
        parseFloat(sjWeidu1),
        parseFloat(sjJingdu2),
        parseFloat(sjWeidu2)
      )
    }
  } catch (sjError) {
    console.error('sjCalculateDrivingDistance 错误:', sjError)
    // 高德API失败时，退回到直线距离计算
    return sjCalculateStraightDistance(
      parseFloat(sjJingdu1),
      parseFloat(sjWeidu1),
      parseFloat(sjJingdu2),
      parseFloat(sjWeidu2)
    )
  }
}
