import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, onSnapshot, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { formatNumber } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';

function SuperAdminDashboard() {
  const { t } = useLanguage();
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInvestor, setNewInvestor] = useState({ name: '', initialCapital: 0, email: '', role: 'investor' });
  const [editingInvestor, setEditingInvestor] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'investors'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvestors(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteInvestor = async (id) => {
    if (window.confirm(t.superAdmin.confirmDelete)) {
      try {
        await deleteDoc(doc(db, 'investors', id));
      } catch (error) {
        console.error("Error deleting investor:", error);
        alert(t.common.error);
      }
    }
  };

  const handleAddInvestor = async (e) => {
    e.preventDefault();
    try {
      if (editingInvestor) {
        await updateDoc(doc(db, 'investors', String(editingInvestor.id)), {
          ...newInvestor,
          initialCapital: parseFloat(newInvestor.initialCapital),
          currentCapital: parseFloat(newInvestor.initialCapital),
        });
        setEditingInvestor(null);
      } else {
        await addDoc(collection(db, 'investors'), {
          ...newInvestor,
          initialCapital: parseFloat(newInvestor.initialCapital),
          currentCapital: parseFloat(newInvestor.initialCapital),
          createdAt: new Date().toISOString()
        });
      }
      setShowAddModal(false);
      setNewInvestor({ name: '', initialCapital: 0, email: '', role: 'investor' });
    } catch (error) {
      console.error("Error saving investor:", error);
      alert(t.common.error);
    }
  };

  const openEditModal = (investor) => {
    setEditingInvestor(investor);
    setNewInvestor({
      name: investor.name,
      email: investor.email || '',
      initialCapital: investor.initialCapital,
      role: investor.role || 'investor'
    });
    setShowAddModal(true);
  };

  if (loading) return <div className="p-8 text-center">{t.common.loading}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t.superAdmin.title}</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          {t.superAdmin.addInvestor}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-gray-600 font-bold">{t.superAdmin.investorName}</th>
              <th className="px-6 py-3 text-gray-600 font-bold">{t.superAdmin.email}</th>
              <th className="px-6 py-3 text-gray-600 font-bold">{t.investors.initialCapital}</th>
              <th className="px-6 py-3 text-gray-600 font-bold">{t.superAdmin.role}</th>
              <th className="px-6 py-3 text-gray-600 font-bold">{t.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {investors.map(investor => (
              <tr key={investor.id} className="hover:bg-amber-50 transition-colors">
                <td className="px-6 py-4 font-medium">{investor.name}</td>
                <td className="px-6 py-4 text-gray-500">{investor.email || 'N/A'}</td>
                <td className="px-6 py-4">{formatNumber(investor.initialCapital)} {t.common.currency}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    investor.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                    investor.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {investor.role === 'super_admin' ? t.superAdmin.superAdminRole : investor.role === 'admin' ? t.superAdmin.admin : t.superAdmin.investor}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button 
                    onClick={() => openEditModal(investor)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    {t.common.edit}
                  </button>
                  <button 
                    onClick={() => handleDeleteInvestor(investor.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    {t.common.delete}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {editingInvestor ? t.superAdmin.editInvestor : t.superAdmin.addInvestor}
            </h3>
            <form onSubmit={handleAddInvestor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.superAdmin.investorName}</label>
                <input 
                  type="text" 
                  required
                  value={newInvestor.name}
                  onChange={(e) => setNewInvestor({...newInvestor, name: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.superAdmin.email}</label>
                <input 
                  type="email" 
                  value={newInvestor.email}
                  onChange={(e) => setNewInvestor({...newInvestor, email: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.investors.initialCapital}</label>
                <input 
                  type="number" 
                  required
                  value={newInvestor.initialCapital}
                  onChange={(e) => setNewInvestor({...newInvestor, initialCapital: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.superAdmin.role}</label>
                <select 
                  value={newInvestor.role}
                  onChange={(e) => setNewInvestor({...newInvestor, role: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="investor">{t.superAdmin.investor}</option>
                  <option value="admin">{t.superAdmin.admin}</option>
                  <option value="super_admin">{t.superAdmin.superAdminRole}</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-amber-600 text-white py-2 rounded-lg font-bold hover:bg-amber-700">
                  {editingInvestor ? t.common.update : t.common.save}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingInvestor(null);
                    setNewInvestor({ name: '', initialCapital: 0, email: '', role: 'investor' });
                  }} 
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200"
                >
                  {t.common.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;
