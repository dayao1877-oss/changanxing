/**
 * 线下支付组件（临时方案）
 * 在接入正式支付前使用
 */

import React from 'react';

interface OfflinePaymentProps {
  orderNo: string;
  depositAmount: number;
  totalAmount: number;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  driverWechat: string;
  onConfirmPayment: () => void;
}

export const OfflinePayment: React.FC<OfflinePaymentProps> = ({
  orderNo,
  depositAmount,
  totalAmount,
  vehicleType,
  driverName,
  driverPhone,
  driverWechat,
  onConfirmPayment
}) => {
  return (
    <div className="offline-payment bg-white/80 backdrop-blur-md p-6 rounded-xl border border-black/5">
      <h3 className="text-lg font-bold text-black mb-4">支付方式</h3>
      
      {/* 订单信息 */}
      <div className="order-info mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">订单号：{orderNo}</p>
        <p className="text-sm text-gray-600 mb-2">车型：{vehicleType}</p>
        <p className="text-sm text-gray-600 mb-2">司机：{driverName}</p>
        <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
          <span className="text-gray-600">总费用：</span>
          <span className="text-lg font-bold text-red-600">¥{totalAmount}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-gray-600">需付定金：</span>
          <span className="text-xl font-bold text-red-600">¥{depositAmount}</span>
        </div>
      </div>

      {/* 支付说明 */}
      <div className="payment-instructions mb-6">
        <h4 className="font-bold text-black mb-3 flex items-center">
          <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs mr-2">1</span>
          联系师傅支付定金
        </h4>
        
        <div className="contact-card p-4 bg-blue-50 rounded-lg mb-4">
          <p className="font-bold text-black mb-2">{driverName}</p>
          <p className="text-sm text-gray-600 mb-1">📱 电话：{driverPhone}</p>
          <p className="text-sm text-gray-600">💬 微信：{driverWechat}</p>
        </div>

        <div className="steps space-y-2">
          <p className="text-sm text-gray-700">
            <span className="font-bold">步骤 1：</span>
            添加师傅微信或拨打电话
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-bold">步骤 2：</span>
            告知订单号，微信转账定金 ¥{depositAmount}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-bold">步骤 3：</span>
            师傅确认后，订单状态将更新为"已确认"
          </p>
        </div>
      </div>

      {/* 温馨提示 */}
      <div className="tips p-4 bg-yellow-50 rounded-lg mb-6 border-l-4 border-yellow-400">
        <p className="text-sm text-gray-700 mb-2">✨ 温馨提示：</p>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>支付定金时请务必备注订单号</li>
          <li>师傅会在收到定金后确认订单</li>
          <li>尾款¥{totalAmount - depositAmount}在服务结束后支付给师傅</li>
          <li>取消政策：提前 3 天以上全退，1-3 天退 50%，当天不退</li>
        </ul>
      </div>

      {/* 确认按钮 */}
      <button
        onClick={onConfirmPayment}
        className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
      >
        我已支付定金
      </button>

      <p className="text-xs text-gray-500 text-center mt-3">
        点击后请告知师傅您已提交订单
      </p>
    </div>
  );
};

export default OfflinePayment;
