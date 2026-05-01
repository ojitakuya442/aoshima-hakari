import { useState, useEffect } from 'react';
import { Users, Search, Edit2, Shield, Trash2, ShieldAlert } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Screen = 'org-dashboard' | 'org-create-job' | 'org-applications' | 'inspector-dashboard' | 'job-detail' | 'messages' | 'profile' | 'history' | 'user-management';

export function UserManagementScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // mock loading users
    setTimeout(() => {
      setUsers([
        { id: '1', name: '山田 太郎', role: 'inspector', email: 'yamada@example.com', status: 'active', registered_at: '2026-04-10' },
        { id: '2', name: '鈴木 一郎', role: 'inspector', email: 'suzuki@example.com', status: 'pending', registered_at: '2026-04-20' },
        { id: '3', name: '佐藤 次郎', role: 'inspector', email: 'sato@example.com', status: 'active', registered_at: '2026-04-28' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">ユーザー管理</h1>
        <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4" />
          <span>権限設定</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="名前やメールアドレスで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ユーザー</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ロール</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ステータス</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">登録日</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">アクション</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-slate-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      検定士
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status === 'active' ? '有効' : '承認待ち'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {user.registered_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button className="text-indigo-600 hover:text-indigo-900" title="編集">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900" title="削除">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
