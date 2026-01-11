import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function DebtForm({ debt, onSubmit, onClose }) {
  const { isSuperAdmin, isAdmin } = useAuth();
  const { language } = useLanguage();

  const [creditorName, setCreditorName] = useState(debt?.creditorName || '');
  const [totalAmount, setTotalAmount] = useState(debt?.totalAmount || '');
  const [paidAmount, setPaidAmount] = useState(debt?.paidAmount || 0);
  const [description, setDescription] = useState(debt?.description || '');
  const [deductFromFund, setDeductFromFund] = useState(debt?.deductFromFund ?? true);
  const [date, setDate] = useState(debt?.date || new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!creditorName || !totalAmount) return;

    const debtData = {
      creditorName,
      totalAmount: parseFloat(totalAmount),
      paidAmount: 0, // Always 0 on creation, must confirm via DebtPaymentForm
      remainingAmount: parseFloat(totalAmount),
      description,
      date,
      status: 'pending',
      payments: []
    };

    onSubmit(debtData);
    onClose();
  };

  const isAr = language === 'ar';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 mb-2 font-bold">{isAr ? 'اسم الدائن (الشخص/الجهة)' : 'Creditor Name'}</label>
        <input
          type="text"
          value={creditorName}
          onChange={(e) => setCreditorName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500"
          required
          placeholder={isAr ? 'مثال: الحداد، محطة الوقود...' : 'e.g. Blacksmith, Fuel Station...'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2 font-bold">{isAr ? 'المبلغ الإجمالي للدين' : 'Total Debt Amount'}</label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500"
            required
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 font-bold">{isAr ? 'التاريخ' : 'Date'}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-bold">{isAr ? 'ملاحظات / وصف' : 'Notes / Description'}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 h-24"
        />
      </div>

      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={deductFromFund}
            onChange={(e) => setDeductFromFund(e.target.checked)}
            className="w-5 h-5 accent-amber-600"
          />
          <span className="text-gray-800 font-bold">
            {isAr ? 'خصم المبلغ المدفوع من الصندوق (وتوزيعه على المستثمرين)' : 'Deduct paid amount from fund (split among investors)'}
          </span>
        </label>
        <p className="text-xs text-amber-700 mt-2 mr-8">
          {isAr 
            ? '* في حال التفعيل، سيتم إنشاء قيد مصروف في الصندوق يخصم من حصة جميع المستثمرين بالتساوي.' 
            : '* If enabled, an expense entry will be created in the fund, deducted equally from all investors.'}
        </p>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors"
        >
          {debt ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'إضافة' : 'Add')}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
        >
          {isAr ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    </form>
  );
}
