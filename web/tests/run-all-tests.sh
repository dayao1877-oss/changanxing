#!/bin/bash

# 长安行 API 测试脚本
# 执行所有接口测试

BASE_URL="http://localhost:3000"
echo "=============================================="
echo "  长安行 API 测试"
echo "  时间: $(date)"
echo "=============================================="
echo ""

# 测试 1: 健康检查
echo "测试 1: 健康检查"
curl -X GET "${BASE_URL}/api/health"
echo ""
echo ""

# 测试 2: 登录 - 成功
echo "测试 2: 登录 - 成功"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/sj-auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "sj_shouji": "13800138000",
    "sj_mima": "123456"
  }')

echo "${LOGIN_RESPONSE}"
echo ""
echo ""

# 提取 Token
SJ_TOKEN=$(echo "${LOGIN_RESPONSE}" | grep -o '"sj_token":"[^"]*"' | cut -d'"' -f4)
echo "获取到的 Token: ${SJ_TOKEN:0:50}..."
echo ""
echo ""

# 测试 3: 获取当前用户信息
echo "测试 3: 获取当前用户信息"
curl -X GET "${BASE_URL}/api/sj-auth/me" \
  -H "Authorization: Bearer ${SJ_TOKEN}"
echo ""
echo ""

# 测试 4: 刷新 Token
echo "测试 4: 刷新 Token"
REFRESH_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/sj-auth/refresh" \
  -H "Authorization: Bearer ${SJ_TOKEN}")
echo "${REFRESH_RESPONSE}"
echo ""
echo ""

# 测试 5: 登出
echo "测试 5: 登出"
curl -X POST "${BASE_URL}/api/sj-auth/logout"
echo ""
echo ""

# 测试 6: 登录 - 密码错误
echo "测试 6: 登录 - 密码错误"
curl -X POST "${BASE_URL}/api/sj-auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "sj_shouji": "13800138000",
    "sj_mima": "wrongpassword"
  }'
echo ""
echo ""

# 测试 7: 未登录访问接口
echo "测试 7: 未登录访问 sj-user/siji"
curl -X GET "${BASE_URL}/api/sj-user/siji"
echo ""
echo ""

# 测试 8: 查询司机列表（使用 Token）
echo "测试 8: 查询司机列表"
curl -X GET "${BASE_URL}/api/sj-user/siji?sj_page=1&sj_page_size=10" \
  -H "Authorization: Bearer ${SJ_TOKEN}"
echo ""
echo ""

# 测试 9: 创建新司机
echo "测试 9: 创建新司机"
curl -X POST "${BASE_URL}/api/sj-user/siji" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SJ_TOKEN}" \
  -d '{
    "sj_bianhao": "SJ002",
    "sj_xingming": "李四",
    "sj_shouji": "13900139000",
    "sj_mima": "123456",
    "sj_chepaihao": "京B67890"
  }'
echo ""
echo ""

echo "=============================================="
echo "  测试完成！"
echo "=============================================="
