import React, { useState, useEffect } from 'react';
import { formatNumber, formatDate } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../Modal';
import DebtForm from '../forms/DebtForm';
import DebtPaymentForm from '../forms/DebtPaymentForm';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function DebtsPage({ investors, onAddDebt, onUpdateDebt, onDeleteDebt, onConfirmPayment }) {
  const { language } = useLanguage();
  const { isAdmin, isSuperAdmin } = useAuth();
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [payingDebt, setPayingDebt] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'debts'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const debtsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDebts(debtsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const totalRemaining = debts.reduce((sum, d) => sum + (d.remainingAmount || 0), 0);
  const totalPaid = debts.reduce((sum, d) => sum + (d.paidAmount || 0), 0);
  const totalDebts = debts.reduce((sum, d) => sum + (d.totalAmount || 0), 0);

  const isAr = language === 'ar';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">{isAr ? 'مدفوع' : 'Paid'}</span>;
      case 'partial':
        return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">{isAr ? 'مدفوع جزئياً' : 'Partial'}</span>;
      default:
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">{isAr ? 'مستحق' : 'Pending'}</span>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{isAr ? 'إدارة الديون والمستحقات' : 'Debt Management'}</h2>
        {(isAdmin() || isSuperAdmin()) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            <span>➕</span> {isAr ? 'إضافة دين' : 'Add Debt'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-red-500">
          <p className="text-gray-500 text-sm mb-1">{isAr ? 'إجمالي الديون المتبقية' : 'Total Remaining'}</p>
          <p className="text-2xl font-bold text-red-600">{formatNumber(totalRemaining)} <span className="text-sm font-normal">ل.س</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
          <p className="text-gray-500 text-sm mb-1">{isAr ? 'إجمالي المدفوعات' : 'Total Paid'}</p>
          <p className="text-2xl font-bold text-green-600">{formatNumber(totalPaid)} <span className="text-sm font-normal">ل.س</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-amber-500">
          <p className="text-gray-500 text-sm mb-1">{isAr ? 'إجمالي المبالغ' : 'Total Gross'}</p>
          <p className="text-2xl font-bold text-amber-600">{formatNumber(totalDebts)} <span className="text-sm font-normal">ل.س</span></p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">{isAr ? 'التاريخ' : 'Date'}</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">{isAr ? 'الدائن' : 'Creditor'}</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">{isAr ? 'المبلغ الإجمالي' : 'Total'}</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">{isAr ? 'المتبقي' : 'Remaining'}</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">{isAr ? 'الحالة' : 'Status'}</th>
                {(isAdmin() || isSuperAdmin()) && (
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">{isAr ? 'إجراءات' : 'Actions'}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {debts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    {isAr ? 'لا يوجد ديون مسجلة' : 'No debts recorded'}
                  </td>
                </tr>
              ) : (
                debts.map((debt) => (
                  <tr key={debt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(debt.date)}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{debt.creditorName}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{debt.description}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{formatNumber(debt.totalAmount)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-red-600">{formatNumber(debt.remainingAmount)}</td>
                    <td className="px-6 py-4">{getStatusBadge(debt.status)}</td>
                    {(isAdmin() || isSuperAdmin()) && (
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {debt.remainingAmount > 0 && (
                            <button
                              onClick={() => setPayingDebt(debt)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-bold flex items-center gap-1"
                              title={isAr ? 'تأكيد دفع' : 'Confirm Payment'}
                            >
                              💵 <span className="text-xs hidden sm:inline">{isAr ? 'دفع' : 'Pay'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => setEditingDebt(debt)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title={isAr ? 'تعديل' : 'Edit'}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا السجل؟' : 'Are you sure you want to delete this record?')) {
                                onDeleteDebt(debt.id);
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title={isAr ? 'حذف' : 'Delete'}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <Modal title={isAr ? 'إضافة دين جديد' : 'Add New Debt'} onClose={() => setShowAddModal(false)}>
          <DebtForm onSubmit={onAddDebt} onClose={() => setShowAddModal(false)} />
        </Modal>
      )}

      {editingDebt && (
        <Modal title={isAr ? 'تعديل بيانات الدين' : 'Edit Debt Details'} onClose={() => setEditingDebt(null)}>
          <DebtForm
            debt={editingDebt}
            onSubmit={(updates) => onUpdateDebt(editingDebt.id, updates)}
            onClose={() => setEditingDebt(null)}
          />
        </Modal>
      )}

      {payingDebt && (
        <Modal title={isAr ? 'تسجيل دفعة للدين' : 'Record Debt Payment'} onClose={() => setPayingDebt(null)}>
          <DebtPaymentForm
            debt={payingDebt}
            investors={investors}
            onSubmit={(paymentData) => {
              onConfirmPayment(payingDebt.id, paymentData);
              setPayingDebt(null);
            }}
            onClose={() => setPayingDebt(null)}
          />
        </Modal>
      )}
    </div>
  );
}
