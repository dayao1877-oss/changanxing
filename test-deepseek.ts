/**
 * DeepSeek API 测试脚本
 */

import { testConnection, chatWithAI } from './src/utils/deepseek';

async function runTests() {
  console.log('🚀 开始 DeepSeek API 测试...\n');

  // 测试 1: 连接测试
  console.log('【测试 1】API 连接测试');
  const connected = await testConnection();
  console.log(connected ? '✅ 连接成功' : '❌ 连接失败');
  console.log('---\n');

  if (!connected) {
    console.error('❌ API 连接失败，请检查 API Key 和网络！');
    return;
  }

  // 测试 2: 常见问题测试
  console.log('【测试 2】常见问题测试\n');

  const questions = [
    '你们有什么车？价格多少？',
    '怎么预约？',
    '定金可以退吗？',
    '姚师傅的电话是多少？',
    '可以当天预约吗？'
  ];

  for (const question of questions) {
    console.log(`Q: ${question}`);
    try {
      const answer = await chatWithAI(question);
      console.log(`A: ${answer}\n`);
    } catch (error) {
      console.error('Error:', error);
    }
    console.log('---\n');
  }

  console.log('✅ 所有测试完成！');
}

// 运行测试
runTests().catch(console.error);
