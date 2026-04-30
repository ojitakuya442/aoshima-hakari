import { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { applicationsApi, inspectorsApi, jobsApi, organizationsApi } from '../../services/api';

type Screen = 'org-dashboard' | 'org-create-job' | 'org-applications' | 'inspector-dashboard' | 'job-detail' | 'messages' | 'profile' | 'history' | 'notifications';

export function HistoryScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const { user, profile } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'rejected' | 'withdrawn'>('all');

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
          setHistory(applications || []);
        }
      } else {
        const org = await organizationsApi.getByUserId(user.id);
        if (org) {
          const jobs = await jobsApi.getByOrganization(org.id);
          const allApplications = [];
          for (const job of jobs || []) {
            const apps = await applicationsApi.getByJob(job.id);
            allApplications.push(...(apps || []).map((a: any) => ({ ...a, job })));
          }
          setHistory(allApplications);
        }
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = filter === 'all'
    ? history
    : history.filter((item) => item.status === filter);

  const stats = {
    total: history.length,
    confirmed: history.filter((h) => h.status === 'confirmed').length,
    rejected: history.filter((h) => h.status === 'rejected').length,
    pending: history.filter((h) => h.status === 'pending').length,
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
        <h1 className="text-3xl font-bold text-slate-900 mb-4">履歴管理</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-slate-700 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'confirmed'
                ? 'bg-slate-700 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            確定済み
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'rejected'
                ? 'bg-slate-700 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            辞退履歴
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-white rounded-lg shadow p-6">
        <div>
          <p className="text-sm text-slate-600 mb-1">総数</p>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 mb-1">確定済み</p>
          <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 mb-1">辞退</p>
          <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600 mb-1">保留中</p>
          <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-500">履歴がありません</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredHistory.map((item) => {
              const job = item.jobs || item.job;
              return (
                <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {job?.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            item.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : item.status === 'withdrawn'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {item.status === 'confirmed'
                            ? '確定済み'
                            : item.status === 'rejected'
                            ? '辞退'
                            : item.status === 'withdrawn'
                            ? '取り下げ'
                            : '保留中'}
                        </span>
                      </div>
                      {job && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{job.inspection_date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{job.prefecture}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>¥{job.reward?.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                      <div className="mt-3 text-sm text-slate-500">
                        応募日: {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
