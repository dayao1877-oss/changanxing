/**
 * DeepSeek AI SDK 封装
 * 用于长安行旅行服务智能客服
 */

const DEEPSEEK_API_KEY = 'sk-0690f299b0064a01bd4476a375edd731';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

/**
 * 知识库 - 长安行业务信息
 */
const KNOWLEDGE_BASE = {
  basic: {
    companyName: '长安行旅行服务',
    serviceModel: '个人定制，一对一服务',
    vehicles: [
      {
        type: 'SUV',
        model: '东风 sky ev01',
        seats: 5,
        driver: '姚师傅',
        price: 580,
        plate: '陕 A·A12345'
      },
      {
        type: '商务车',
        model: '别克 GL8',
        seats: 7,
        driver: '王磊',
        price: 780,
        plate: '陕 A·A54321'
      }
    ],
    contact: [
      { name: '姚师傅', phone: '18091827305', wechat: 'lovconky' },
      { name: '王磊', phone: '15339120068', wechat: '15339120068' }
    ]
  },
  rules: {
    booking: '至少提前 1 天预约',
    deposit: '定金为总费用的 20%',
    cancellation: `
      提前 3 天以上取消：全退
      提前 1-3 天取消：退 50%
      当天取消：不退
    `,
    include: '价格已含油费和司机服务费',
    exclude: '过路费、停车费需客户承担'
  },
  services: {
    guide: { name: '导游讲解', price: 100 },
    photography: { name: '跟拍摄影', price: 200 }
  }
};

/**
 * 系统提示词 - 定义 AI 角色和回答风格
 */
const SYSTEM_PROMPT = `你是一个亲切友好的西安旅行助手，叫"小安"。
你是长安行旅行服务的智能客服，专门为用户提供包车、门票预订等服务咨询。

你的特点：
- 语气亲切友好，像朋友一样交流
- 适当使用 emoji 表情（😊👍✨🚗📸），但不要过度
- 回答简洁明了，重点突出
- 专业但不失温度

业务范围：
${JSON.stringify(KNOWLEDGE_BASE, null, 2)}

回答规范：
1. 价格问题：明确说明费用包含和不包含的项目
2. 预约问题：强调提前 1 天预约和定金政策
3. 车型选择：根据人数推荐合适车型
4. 联系方式：提供两位师傅的电话/微信

如果用户问的问题不在知识库中，礼貌告知并建议联系人工客服。`;

/**
 * 调用 DeepSeek API
 */
export async function chatWithAI(userMessage: string, conversationHistory: any[] = []): Promise<string> {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API 调用失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('DeepSeek API Error:', error);
    throw error;
  }
}

/**
 * 测试 API 连通性
 */
export async function testConnection(): Promise<boolean> {
  try {
    const response = await chatWithAI('你好，请介绍一下你自己');
    console.log('✅ DeepSeek API 连接成功:', response);
    return true;
  } catch (error) {
    console.error('❌ DeepSeek API 连接失败:', error);
    return false;
  }
}

/**
 * 常见问题快速回复
 */
export const FAQ_RESPONSES = {
  greeting: '您好呀～我是长安行的小安，您的旅行助手！有什么可以帮您的吗？😊',
  
  price: (type: string) => {
    const vehicles = KNOWLEDGE_BASE.basic.vehicles;
    const vehicle = vehicles.find(v => v.type.toLowerCase().includes(type.toLowerCase()));
    if (vehicle) {
      return `亲～${vehicle.type}的价格是¥${vehicle.price}/天哦～\n\n包含：\n✅ 用车服务\n✅ 司机服务\n✅ 油费\n\n不含：\n❌ 过路费\n❌ 停车费\n\n需要我帮您介绍预订流程吗？😊`;
    }
    return `我们的价格根据车型不同哦～\n🚙 SUV：¥580/天\n🚐 商务车：¥780/天\n\n您几个人出行呢？我帮您推荐合适的车型～`;
  },
  
  booking: `亲～预约很简单哒！\n\n1️⃣ 在小程序选择日期\n2️⃣ 选择喜欢的车型（SUV 或商务车）\n3️⃣ 填写您的联系信息\n4️⃣ 支付 20% 定金\n5️⃣ 等待师傅微信联系您确认细节\n\n就这么简单！期待与您相遇西安！😊`,
  
  deposit: `定金是总费用的 20% 哦～\n\n比如预订 SUV 一天：\n总价：¥580\n定金：¥116\n尾款：¥464（服务结束后支付）\n\n【取消政策】\n✅ 提前 3 天以上：全退\n✅ 提前 1-3 天：退 50%\n❌ 当天：不退哦～`,
  
  contact: `您可以通过以下方式联系我们：\n\n👨‍✈️ 姚师傅（SUV）\n📱 电话/微信：18091827305\n💬 微信：lovconky\n\n👨‍✈️ 王磊师傅（商务车）\n📱 电话/微信：15339120068\n💬 微信：15339120068\n\n有任何问题都可以随时联系哦～😊`
};

export default {
  chatWithAI,
  testConnection,
  FAQ_RESPONSES,
  KNOWLEDGE_BASE
};
