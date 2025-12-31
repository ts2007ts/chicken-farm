import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { subscribeToUsers, updateUserRole } from '../firebase/firestore'
import Modal from './Modal'

function AdminUserManager({ investors }) {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedInvestor, setSelectedInvestor] = useState('')
  const [selectedRole, setSelectedRole] = useState('investor')
  const { isAdmin } = useAuth()

  useEffect(() => {
    if (!isAdmin()) return

    const unsubscribe = subscribeToUsers((fetchedUsers) => {
      setUsers(fetchedUsers)
    })

    return () => unsubscribe()
  }, [isAdmin])

  if (!isAdmin()) return null

  function handleEditUser(user) {
    setSelectedUser(user)
    setSelectedInvestor(user.investorId ? String(user.investorId) : '')
    setSelectedRole(user.role || 'investor')
    setShowModal(true)
  }

  async function handleSaveUser() {
    if (!selectedUser) return

    const investor = investors.find(inv => inv.id === parseInt(selectedInvestor))
    
    await updateUserRole(
      selectedUser.uid,
      investor?.name || null,
      investor?.id || null,
      selectedRole
    )

    setShowModal(false)
    setSelectedUser(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>👥</span>
        إدارة المستخدمين
      </h3>

      {users.length === 0 ? (
        <p className="text-gray-500 text-center py-4">لا يوجد مستخدمين مسجلين</p>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <div 
              key={user.uid} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  user.role === 'admin' ? 'bg-amber-500' : 'bg-blue-500'
                }`}>
                  {user.investorName ? user.investorName.charAt(0) : '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {user.investorName || 'غير محدد'}
                    {user.role === 'admin' && (
                      <span className="mr-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        مدير
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleEditUser(user)}
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                ✏️ تعديل
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit User Modal */}
      {showModal && (
        <Modal title="تعديل صلاحيات المستخدم" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 mb-2">البريد الإلكتروني:</p>
              <p className="font-bold text-gray-800">{selectedUser?.email}</p>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">ربط بمستثمر:</label>
              <select
                value={selectedInvestor}
                onChange={(e) => setSelectedInvestor(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- اختر مستثمر --</option>
                {investors.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">الصلاحية:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500"
              >
                <option value="investor">مستثمر (قراءة فقط + تعديل بياناته)</option>
                <option value="admin">مدير (صلاحيات كاملة)</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSaveUser}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-bold transition-all"
              >
                حفظ
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-bold transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdminUserManager
