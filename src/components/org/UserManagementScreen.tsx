import { useState, useEffect } from 'react';
import { Users, Search, Edit2, Trash2, Plus, X, ArrowUpDown, ChevronDown } from 'lucide-react';
import { REGIONS, PREFECTURES } from '../../lib/constants';

type Screen = 'org-dashboard' | 'org-create-job' | 'org-applications' | 'inspector-dashboard' | 'job-detail' | 'messages' | 'profile' | 'history' | 'user-management';

type Role = 'inspector' | 'organization';

type UserEntry = {
  id: string;
  name: string;
  role: Role;
  email: string;
  registered_at: string;
  // 検定機関ユーザー
  affiliated_org?: string;
  // 検定官ユーザー
  region?: string;
  prefecture?: string;
  city?: string;
};

type ModalMode = 'create' | 'edit' | 'delete' | null;

const ORG_OPTIONS = ['青島計量検定センター', '関東総合検定機関', '近畿検定協会'];

const MOCK_USERS: UserEntry[] = [
  { id: '1', name: '山田 太郎', role: 'inspector',    email: 'yamada@example.com',  registered_at: '2026-04-10', region: '関東',   prefecture: '東京都',  city: '新宿区' },
  { id: '2', name: '鈴木 一郎', role: 'inspector',    email: 'suzuki@example.com',  registered_at: '2026-04-20', region: '関東',   prefecture: '神奈川県', city: '横浜市中区' },
  { id: '3', name: '佐藤 次郎', role: 'inspector',    email: 'sato@example.com',    registered_at: '2026-04-28', region: '近畿',   prefecture: '大阪府',  city: '大阪市北区' },
  { id: '4', name: '田中 花子', role: 'inspector',    email: 'tanaka@example.com',  registered_at: '2026-03-15', region: '中部',   prefecture: '愛知県',  city: '名古屋市中区' },
  { id: '5', name: '伊藤 誠',   role: 'inspector',    email: 'ito@example.com',     registered_at: '2026-04-30', region: '九州・沖縄', prefecture: '福岡県', city: '福岡市博多区' },
  { id: '6', name: '渡辺 幸子', role: 'inspector',    email: 'watanabe@example.com',registered_at: '2026-04-05', region: '北海道・東北', prefecture: '宮城県', city: '仙台市太白区' },
  { id: '7', name: '小林 大輔', role: 'organization', email: 'kobayashi@example.com',registered_at: '2026-03-20', affiliated_org: '関東総合検定機関' },
  { id: '8', name: '加藤 美咲', role: 'organization', email: 'kato@example.com',    registered_at: '2026-04-12', affiliated_org: '近畿検定協会' },
];

const emptyForm = (): Omit<UserEntry, 'id' | 'registered_at'> => ({
  name: '',
  email: '',
  role: 'inspector',
  affiliated_org: '',
  region: 'all',
  prefecture: 'all',
  city: '',
});

export function UserManagementScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | Role>('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterPrefecture, setFilterPrefecture] = useState('all');
  const [filterOrg, setFilterOrg] = useState('all');

  // Sort
  const [sortField, setSortField] = useState<'name' | 'registered_at'>('registered_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Modal
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<UserEntry | null>(null);
  const [formData, setFormData] = useState(emptyForm());

  // Derived: prefectures available for selected region
  const availablePrefectures = filterRegion !== 'all' ? (REGIONS[filterRegion] || []) : PREFECTURES;
  const formPrefectures = formData.region && formData.region !== 'all' ? (REGIONS[formData.region] || []) : PREFECTURES;

  useEffect(() => {
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setLoading(false);
    }, 400);
  }, []);

  const openCreate = () => {
    setFormData(emptyForm());
    setModalMode('create');
  };

  const openEdit = (u: UserEntry) => {
    setSelectedUser(u);
    setFormData({ name: u.name, email: u.email, role: u.role, affiliated_org: u.affiliated_org || '', region: u.region || 'all', prefecture: u.prefecture || 'all', city: u.city || '' });
    setModalMode('edit');
  };

  const openDelete = (u: UserEntry) => {
    setSelectedUser(u);
    setModalMode('delete');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

  const handleCreate = () => {
    const newUser: UserEntry = {
      id: String(Date.now()),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      registered_at: new Date().toISOString().split('T')[0],
      ...(formData.role === 'organization'
        ? { affiliated_org: formData.affiliated_org }
        : { region: formData.region, prefecture: formData.prefecture, city: formData.city }),
    };
    setUsers((prev) => [newUser, ...prev]);
    closeModal();
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              name: formData.name,
              email: formData.email,
              role: formData.role,
              affiliated_org: formData.role === 'organization' ? formData.affiliated_org : undefined,
              region: formData.role === 'inspector' ? formData.region : undefined,
              prefecture: formData.role === 'inspector' ? formData.prefecture : undefined,
              city: formData.role === 'inspector' ? formData.city : undefined,
            }
          : u
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
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const filteredUsers = users
    .filter((u) => {
      if (search && !u.name.includes(search) && !u.email.includes(search)) return false;
      if (filterRole !== 'all' && u.role !== filterRole) return false;
      if (filterRegion !== 'all' && u.region !== filterRegion) return false;
      if (filterPrefecture !== 'all' && u.prefecture !== filterPrefecture) return false;
      if (filterOrg !== 'all' && u.affiliated_org !== filterOrg) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'name') return a.name.localeCompare(b.name, 'ja') * dir;
      return a.registered_at.localeCompare(b.registered_at) * dir;
    });

  const roleLabel = (role: Role) => role === 'inspector' ? '検定官' : '検定機関';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">ユーザー管理</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>新規登録</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* ─── Filters ─── */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          {/* Row 1: search + role */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="名前・メールアドレスで検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
              />
            </div>
            <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value as any); setFilterRegion('all'); setFilterPrefecture('all'); setFilterOrg('all'); }}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm">
              <option value="all">すべての権限</option>
              <option value="inspector">検定官</option>
              <option value="organization">検定機関</option>
            </select>
          </div>

          {/* Row 2: area filters (inspector only) or org filter */}
          {filterRole !== 'organization' && (
            <div className="flex flex-wrap gap-3">
              <select value={filterRegion} onChange={(e) => { setFilterRegion(e.target.value); setFilterPrefecture('all'); }}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm">
                <option value="all">すべての地方</option>
                {Object.keys(REGIONS).map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select value={filterPrefecture} onChange={(e) => setFilterPrefecture(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm"
                disabled={filterRegion === 'all'}>
                <option value="all">都道府県を選択</option>
                {availablePrefectures.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}
          {filterRole !== 'inspector' && (
            <div className="flex flex-wrap gap-3">
              <select value={filterOrg} onChange={(e) => setFilterOrg(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm">
                <option value="all">すべての所属機関</option>
                {ORG_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none" onClick={() => toggleSort('name')}>
                  <span className="flex items-center gap-1">ユーザー <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">権限</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">所属 / エリア</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none" onClick={() => toggleSort('registered_at')}>
                  <span className="flex items-center gap-1">登録日 <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">アクション</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-slate-700"></div></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">該当するユーザーが見つかりません</td></tr>
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'inspector' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {u.role === 'organization'
                        ? (u.affiliated_org || '—')
                        : [u.prefecture, u.city].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.registered_at}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button onClick={() => openEdit(u)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="編集"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => openDelete(u)} className="text-red-600 hover:text-red-900 transition-colors" title="削除"><Trash2 className="w-4 h-4" /></button>
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-900">{modalMode === 'create' ? '新規ユーザー登録' : 'ユーザー情報を編集'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {/* 基本情報 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">氏名 <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm" placeholder="例: 山田 太郎" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm" placeholder="example@mail.com" />
              </div>

              {/* 権限 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">権限</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as Role, affiliated_org: '', region: 'all', prefecture: 'all', city: '' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm">
                  <option value="inspector">検定官</option>
                  <option value="organization">検定機関</option>
                </select>
              </div>

              {/* 検定機関ユーザー: 所属機関 */}
              {formData.role === 'organization' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">所属検定機関</label>
                  <select value={formData.affiliated_org} onChange={(e) => setFormData({ ...formData, affiliated_org: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm">
                    <option value="">選択してください</option>
                    {ORG_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )}

              {/* 検定官: 住所（3段階） */}
              {formData.role === 'inspector' && (
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">住所</p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">地方</label>
                    <select value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value, prefecture: 'all', city: '' })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm">
                      <option value="all">選択してください</option>
                      {Object.keys(REGIONS).map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">都道府県</label>
                    <select value={formData.prefecture} onChange={(e) => setFormData({ ...formData, prefecture: e.target.value, city: '' })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm"
                      disabled={formData.region === 'all'}>
                      <option value="all">都道府県を選択</option>
                      {formPrefectures.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">市区町村</label>
                    <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm"
                      placeholder="例: 横浜市中区" disabled={formData.prefecture === 'all'} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm">キャンセル</button>
              <button onClick={modalMode === 'create' ? handleCreate : handleEdit}
                disabled={!formData.name || !formData.email}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm disabled:bg-slate-400">
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
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-slate-600">以下のユーザーを削除します。この操作は取り消せません。</p>
            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-900">{selectedUser.name}</p>
              <p className="text-xs text-slate-500">{selectedUser.email}</p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm">キャンセル</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">削除する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
