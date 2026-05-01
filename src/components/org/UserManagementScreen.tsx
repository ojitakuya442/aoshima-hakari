import { useState, useEffect } from 'react';
import { Users, Search, Edit2, Trash2, Plus, X, ArrowUpDown } from 'lucide-react';

type Screen = 'org-dashboard' | 'org-create-job' | 'org-applications' | 'inspector-dashboard' | 'job-detail' | 'messages' | 'profile' | 'history' | 'user-management';

type User = {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'pending';
  registered_at: string;
};

type ModalMode = 'create' | 'edit' | 'delete' | null;

const MOCK_USERS: User[] = [
  { id: '1', name: '山田 太郎', role: 'inspector', email: 'yamada@example.com', status: 'active', registered_at: '2026-04-10' },
  { id: '2', name: '鈴木 一郎', role: 'inspector', email: 'suzuki@example.com', status: 'pending', registered_at: '2026-04-20' },
  { id: '3', name: '佐藤 次郎', role: 'inspector', email: 'sato@example.com', status: 'active', registered_at: '2026-04-28' },
  { id: '4', name: '田中 花子', role: 'inspector', email: 'tanaka@example.com', status: 'active', registered_at: '2026-03-15' },
  { id: '5', name: '伊藤 誠', role: 'inspector', email: 'ito@example.com', status: 'pending', registered_at: '2026-04-30' },
];

export function UserManagementScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending'>('all');
  const [sortField, setSortField] = useState<'name' | 'registered_at'>('registered_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', status: 'active' as 'active' | 'pending' });

  useEffect(() => {
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setLoading(false);
    }, 400);
  }, []);

  const openCreate = () => {
    setFormData({ name: '', email: '', status: 'active' });
    setModalMode('create');
  };

  const openEdit = (u: User) => {
    setSelectedUser(u);
    setFormData({ name: u.name, email: u.email, status: u.status });
    setModalMode('edit');
  };

  const openDelete = (u: User) => {
    setSelectedUser(u);
    setModalMode('delete');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

  const handleCreate = () => {
    const newUser: User = {
      id: String(Date.now()),
      name: formData.name,
      email: formData.email,
      role: 'inspector',
      status: formData.status,
      registered_at: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [newUser, ...prev]);
    closeModal();
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id ? { ...u, name: formData.name, email: formData.email, status: formData.status } : u
      )
    );
    closeModal();
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    closeModal();
  };

  const toggleSort = (field: 'name' | 'registered_at') => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredUsers = users
    .filter((u) => {
      if (search && !u.name.includes(search) && !u.email.includes(search)) return false;
      if (filterStatus !== 'all' && u.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'name') return a.name.localeCompare(b.name, 'ja') * dir;
      return a.registered_at.localeCompare(b.registered_at) * dir;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">ユーザー管理</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>新規登録</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="名前やメールアドレスで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
          >
            <option value="all">すべてのステータス</option>
            <option value="active">有効</option>
            <option value="pending">承認待ち</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => toggleSort('name')}
                >
                  <span className="flex items-center gap-1">
                    ユーザー
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ロール</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ステータス</th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => toggleSort('registered_at')}
                >
                  <span className="flex items-center gap-1">
                    登録日
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">アクション</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-slate-700"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    該当するユーザーが見つかりません
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-slate-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{u.name}</div>
                          <div className="text-sm text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        検定士
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {u.status === 'active' ? '有効' : '承認待ち'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.registered_at}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => openEdit(u)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="編集"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDelete(u)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ────────── Modal: Create / Edit ────────── */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                {modalMode === 'create' ? '新規ユーザー登録' : 'ユーザー情報を編集'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">氏名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="例: 山田 太郎"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="example@mail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ステータス</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="active">有効</option>
                  <option value="pending">承認待ち</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={modalMode === 'create' ? handleCreate : handleEdit}
                disabled={!formData.name || !formData.email}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm disabled:bg-slate-400"
              >
                {modalMode === 'create' ? '登録する' : '保存する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────── Modal: Delete ────────── */}
      {modalMode === 'delete' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">ユーザーを削除</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-1">
              以下のユーザーを削除します。この操作は取り消せません。
            </p>
            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-900">{selectedUser.name}</p>
              <p className="text-xs text-slate-500">{selectedUser.email}</p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
