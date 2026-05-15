import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, JapaneseYen, Hotel } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { applicationsApi, inspectorsApi, jobsApi, organizationsApi } from '../../services/api';
import { REGIONS } from '../../lib/constants';

type Screen = 'org-dashboard' | 'org-create-job' | 'org-applications' | 'inspector-dashboard' | 'job-detail' | 'messages' | 'profile' | 'history' | 'notifications';

type HistoryStatus = 'completed' | 'withdrawn' | 'cancelled';

type HistoryItem = {
  id: string;
  job: any;
  status: HistoryStatus;
  appliedAt?: string;
};

export function HistoryScreen({ onNavigate, onSelectJob }: { onNavigate: (screen: Screen) => void; onSelectJob?: (jobId: string) => void }) {
  const { user, profile } = useAuth();
  const isOrg = profile?.role === 'organization';
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | HistoryStatus>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterPrefecture, setFilterPrefecture] = useState('all');
  const [filterCity, setFilterCity] = useState('');

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  useEffect(() => {
    loadHistory();
  }, [user, profile]);

  const loadHistory = async () => {
    if (!user || !profile) return;

    try {
      if (profile.role === 'inspector') {
        const inspector = await inspectorsApi.getByUserId(user.id);
        if (inspector) {
          const applications = await applicationsApi.getByInspector(inspector.id);
          const items: HistoryItem[] = [];
          for (const app of applications || []) {
            const job = (app as any).jobs || (app as any).job || (await jobsApi.getById((app as any).job_id));
            if (!job) continue;
            const past = job.inspection_date && job.inspection_date < todayStr;
            if ((app as any).status === 'confirmed' && past) {
              items.push({ id: (app as any).id, job, status: 'completed', appliedAt: (app as any).created_at });
            } else if ((app as any).status === 'withdrawn') {
              items.push({ id: (app as any).id, job, status: 'withdrawn', appliedAt: (app as any).created_at });
            }
          }
          setHistory(items);
        }
      } else {
        const org = await organizationsApi.getByUserId(user.id);
        if (org) {
          const jobs = await jobsApi.getByOrganization(org.id);
          const items: HistoryItem[] = [];
          for (const job of jobs || []) {
            if (job.status === 'cancelled') {
              items.push({ id: job.id, job, status: 'cancelled' });
              continue;
            }
            const past = job.inspection_date && job.inspection_date < todayStr;
            if (past) {
              items.push({ id: job.id, job, status: 'completed' });
            }
          }
          setHistory(items);
        }
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filter !== 'all' && item.status !== filter) return false;
    if (dateFrom && item.job.inspection_date && item.job.inspection_date < dateFrom) return false;
    if (dateTo && item.job.inspection_date && item.job.inspection_date > dateTo) return false;
    if (filterRegion !== 'all') {
      const prefs = REGIONS[filterRegion] || [];
      if (!prefs.includes(item.job.prefecture)) return false;
    }
    if (filterPrefecture !== 'all' && item.job.prefecture !== filterPrefecture) return false;
    if (filterCity && !(item.job.city || '').includes(filterCity)) return false;
    return true;
  }).sort((a, b) => (b.job.inspection_date || '').localeCompare(a.job.inspection_date || ''));

  const stats = {
    total: history.length,
    completed: history.filter((h) => h.status === 'completed').length,
    withdrawn: history.filter((h) => h.status === 'withdrawn').length,
    cancelled: history.filter((h) => h.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">履歴</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-slate-600 mb-1">総数</p>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-slate-600 mb-1">実施済</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
        {isOrg ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-600 mb-1">中止</p>
            <p className="text-3xl font-bold text-slate-600">{stats.cancelled}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-600 mb-1">辞退</p>
            <p className="text-3xl font-bold text-red-600">{stats.withdrawn}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">履歴一覧</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                title="開始日"
                max={dateTo || undefined}
              />
              <span className="text-slate-500 text-sm">〜</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                title="終了日"
                min={dateFrom || undefined}
              />
            </div>
            <select
              value={filterRegion}
              onChange={(e) => { setFilterRegion(e.target.value); setFilterPrefecture('all'); }}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="all">すべての地方</option>
              {Object.keys(REGIONS).map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <select
              value={filterPrefecture}
              onChange={(e) => setFilterPrefecture(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="all">すべての都道府県</option>
              {(filterRegion === 'all' ? Object.values(REGIONS).flat() : REGIONS[filterRegion] || []).map((pref) => (
                <option key={pref} value={pref}>{pref}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="市区町村"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent w-32"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | HistoryStatus)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="all">すべてのステータス</option>
              <option value="completed">実施済</option>
              {isOrg ? (
                <option value="cancelled">中止</option>
              ) : (
                <option value="withdrawn">辞退</option>
              )}
            </select>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-500">該当する履歴がありません</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredHistory.map((item) => {
              const job = item.job;
              const statusBadge = item.status === 'completed' ? (
                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-medium">
                  実施済
                </span>
              ) : item.status === 'cancelled' ? (
                <span className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700 font-medium">
                  中止
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 font-medium">
                  辞退
                </span>
              );

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectJob && onSelectJob(job.id)}
                  className={`p-6 transition-colors ${onSelectJob ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {job.job_number && <span className="text-xl font-bold text-slate-900">{job.job_number}</span>}
                        <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                        {statusBadge}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{job.inspection_date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{job.start_time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{job.prefecture} {job.city || ''}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <JapaneseYen className="w-4 h-4" />
                          <span className="font-semibold text-slate-900">¥{job.reward?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {job.accommodation && job.accommodation !== 'none' ? (
                            <>
                              <Hotel className="w-4 h-4 text-blue-600" />
                              <span className="text-blue-600">
                                {job.accommodation === 'before' ? '宿泊（前泊）' :
                                 job.accommodation === 'after' ? '宿泊（後泊）' :
                                 job.accommodation === 'both' ? '宿泊（前後泊）' : '宿泊あり'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Hotel className="w-4 h-4" />
                              <span>宿泊なし</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        ※ 実施日経過の案件は自動でこちらに表示されます。ファイルの閲覧・追加アップロードは詳細画面から行えます（内容変更不可）。
      </p>
    </div>
  );
}
