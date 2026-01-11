import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatNumber } from '../../utils/helpers';

export default function DebtPaymentForm({ debt, investors, onSubmit, onClose }) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [amount, setAmount] = useState(debt.remainingAmount || 0);
  const [source, setSource] = useState('fund'); // 'fund' or 'investors'
  const [investorAmounts, setInvestorAmounts] = useState({}); // { investorId: amount }
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleInvestorAmountChange = (id, val) => {
    const newAmounts = { ...investorAmounts, [id]: parseFloat(val) || 0 };
    setInvestorAmounts(newAmounts);
    
    // Update total amount based on individual inputs
    const newTotal = Object.values(newAmounts).reduce((sum, a) => sum + a, 0);
    setAmount(newTotal);
  };

  const toggleInvestor = (id) => {
    if (investorAmounts.hasOwnProperty(id)) {
      const { [id]: _, ...rest } = investorAmounts;
      setInvestorAmounts(rest);
      const newTotal = Object.values(rest).reduce((sum, a) => sum + a, 0);
      setAmount(newTotal);
    } else {
      const newAmounts = { ...investorAmounts, [id]: 0 };
      setInvestorAmounts(newAmounts);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount <= 0) return;
    if (amount > debt.remainingAmount) {
      alert(isAr ? 'المبلغ المدفوع يتجاوز المتبقي' : 'Payment exceeds remaining amount');
      return;
    }
    
    if (source === 'investors') {
      const selectedIds = Object.keys(investorAmounts).filter(id => investorAmounts[id] > 0);
      if (selectedIds.length === 0) {
        alert(isAr ? 'يرجى اختيار مستثمر واحد على الأقل وإدخال مبلغ' : 'Please select at least one investor and enter an amount');
        return;
      }
      
      const totalEntered = Object.values(investorAmounts).reduce((sum, a) => sum + a, 0);
      if (Math.abs(totalEntered - amount) > 0.01) {
        alert(isAr ? 'مجموع مبالغ المستثمرين لا يساوي المبلغ الإجمالي' : 'Total investor amounts do not match total payment');
        return;
      }

      onSubmit({
        amount: parseFloat(amount),
        source,
        investorPayments: investorAmounts, // Send the mapping
        date
      });
    } else {
      onSubmit({
        amount: parseFloat(amount),
        source,
        date
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-amber-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-amber-800">
          <strong>{isAr ? 'الدائن:' : 'Creditor:'}</strong> {debt.creditorName}
        </p>
        <p className="text-sm text-amber-800">
          <strong>{isAr ? 'المبلغ المتبقي:' : 'Remaining:'}</strong> {debt.remainingAmount} ل.س
        </p>
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-bold">
          {isAr ? 'إجمالي مبلغ الدفعة' : 'Total Payment Amount'}
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          max={debt.remainingAmount}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500"
          required
          disabled={source === 'investors'}
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-bold">{isAr ? 'تاريخ الدفع' : 'Payment Date'}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-bold">{isAr ? 'مصدر الدفع' : 'Payment Source'}</label>
        <div className="flex gap-4">
          <label className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors has-[:checked]:bg-amber-100 has-[:checked]:border-amber-500">
            <input
              type="radio"
              name="source"
              value="fund"
              checked={source === 'fund'}
              onChange={(e) => setSource(e.target.value)}
              className="hidden"
            />
            <span className="font-bold">{isAr ? 'الصندوق' : 'Fund'}</span>
          </label>
          <label className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors has-[:checked]:bg-amber-100 has-[:checked]:border-amber-500">
            <input
              type="radio"
              name="source"
              value="investors"
              checked={source === 'investors'}
              onChange={(e) => setSource(e.target.value)}
              className="hidden"
            />
            <span className="font-bold">{isAr ? 'مستثمر محدد' : 'Specific Investor'}</span>
          </label>
        </div>
      </div>

      {source === 'investors' && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-bold text-gray-600">{isAr ? 'تحديد مبالغ المستثمرين:' : 'Specify investor amounts:'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {investors.map(inv => (
              <div key={inv.id} className={`flex flex-col gap-2 p-3 border rounded-xl transition-colors ${investorAmounts.hasOwnProperty(inv.id) ? 'bg-amber-50 border-amber-500' : 'hover:bg-gray-50'}`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={investorAmounts.hasOwnProperty(inv.id)}
                    onChange={() => toggleInvestor(inv.id)}
                    className="w-5 h-5 accent-amber-600"
                  />
                  <span className="text-sm font-bold text-gray-800">{inv.name}</span>
                </label>
                {investorAmounts.hasOwnProperty(inv.id) && (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={investorAmounts[inv.id]}
                      onChange={(e) => handleInvestorAmountChange(inv.id, e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 font-bold text-amber-700"
                    />
                    <span className="text-xs text-gray-500 font-bold">{isAr ? 'ل.س' : 'SYP'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="bg-amber-100 p-3 rounded-xl text-center border-2 border-amber-200">
            <span className="text-base font-bold text-amber-900">
              {isAr ? 'إجمالي مساهمات المستثمرين:' : 'Total Contributions:'} {formatNumber(amount)} {isAr ? 'ل.س' : 'SYP'}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6 pt-4 border-t">
        <button
          type="submit"
          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
        >
          {isAr ? 'تأكيد الدفع' : 'Confirm Payment'}
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
