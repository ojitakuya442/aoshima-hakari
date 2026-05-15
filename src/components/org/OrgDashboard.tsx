import { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users, Hotel, Briefcase, Check, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { jobsApi, organizationsApi, applicationsApi } from '../../services/api';
import { REGIONS } from '../../lib/constants';

type Screen = 'org-dashboard' | 'org-create-job' | 'org-applications' | 'job-detail' | 'messages' | 'profile' | 'history' | 'notifications';

export function OrgDashboard({
  onNavigate,
  onSelectJob,
}: {
  onNavigate: (screen: Screen, jobId?: string) => void;
  onSelectJob: (jobId: string) => void;
}) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobApplicationCounts, setJobApplicationCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({ draft: 0, open: 0, confirmed: 0 });
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterPrefecture, setFilterPrefecture] = useState('all');
  const [filterCity, setFilterCity] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSort, setFilterSort] = useState('created_desc');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const org = await organizationsApi.getByUserId(user.id);
      if (org) {
        const jobsData = await jobsApi.getByOrganization(org.id);
        const allJobs = jobsData || [];
        const fetchedJobs = allJobs.filter((j: any) => {
          if (j.status === 'cancelled' || j.status === 'completed') return false;
          if (j.inspection_date && j.inspection_date < todayStr) return false;
          return true;
        });
        setJobs(fetchedJobs);

        const counts: Record<string, number> = {};
        let totalPending = 0;

        for (const job of fetchedJobs) {
          const apps = await applicationsApi.getByJob(job.id);
          const pendingApps = apps?.filter((a) => a.status === 'pending').length || 0;
          counts[job.id] = pendingApps;
          totalPending += pendingApps;
        }

        setJobApplicationCounts(counts);

        const draftCount = fetchedJobs.filter((j: any) => j.status === 'draft').length || 0;
        const openCount = fetchedJobs.filter((j: any) => j.status === 'open').length || 0;
        const confirmedCount = fetchedJobs.filter((j: any) => j.status === 'confirmed').length || 0;

        setStats({ draft: draftCount, open: openCount, confirmed: confirmedCount });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplications = (jobId: string) => {
    onNavigate('org-applications', jobId);
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">検定依頼管理</h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onNavigate('org-create-job')}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>新規検定依頼</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">募集前</p>
              <p className="text-3xl font-bold text-slate-900">{stats.draft}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">募集中</p>
              <p className="text-3xl font-bold text-slate-900">{stats.open}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">確定済</p>
              <p className="text-3xl font-bold text-slate-900">{stats.confirmed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">検定依頼一覧</h2>
          <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  title="開始日"
                  max={filterDateTo || undefined}
                />
                <span className="text-slate-500 text-sm">〜</span>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  title="終了日"
                  min={filterDateFrom || undefined}
                />
              </div>
              <select
                value={filterRegion}
                onChange={(e) => {
                  setFilterRegion(e.target.value);
                  setFilterPrefecture('all');
                }}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="all">すべての地方</option>
                {Object.keys(REGIONS).map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <select
                value={filterPrefecture}
                onChange={(e) => setFilterPrefecture(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                disabled={filterRegion !== 'all' && !REGIONS[filterRegion]}
              >
                <option value="all">すべての都道府県</option>
                {(filterRegion === 'all' ? Object.values(REGIONS).flat() : REGIONS[filterRegion] || []).map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="市区町村を入力"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent w-32"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="all">すべてのステータス</option>
                <option value="draft">募集前</option>
                <option value="open">募集中</option>
                <option value="confirmed">確定済</option>
              </select>
              <select
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="created_desc">新着順</option>
                <option value="inspection_asc">開催日が近い順</option>
                <option value="inspection_desc">開催日が遠い順</option>
              </select>
          </div>
        </div>
        {jobs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            検定依頼がまだありません。新規作成してください。
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {jobs.filter(job => {
              if (filterDateFrom && (!job.inspection_date || job.inspection_date < filterDateFrom)) return false;
              if (filterDateTo && (!job.inspection_date || job.inspection_date > filterDateTo)) return false;
              if (filterRegion !== 'all') {
                const prefecturesInRegion = REGIONS[filterRegion] || [];
                if (!prefecturesInRegion.includes(job.prefecture)) return false;
              }
              if (filterPrefecture !== 'all' && job.prefecture !== filterPrefecture) return false;
              if (filterCity && !job.city?.includes(filterCity)) return false;
              if (filterStatus !== 'all' && job.status !== filterStatus) return false;
              return true;
            }).sort((a, b) => {
              if (filterSort === 'inspection_asc') return a.inspection_date.localeCompare(b.inspection_date);
              if (filterSort === 'inspection_desc') return b.inspection_date.localeCompare(a.inspection_date);
              if (filterSort === 'created_desc') return b.created_at.localeCompare(a.created_at);
              return 0;
            }).map((job) => {
              const applicationCount = jobApplicationCounts[job.id] || 0;
              const getStatusBadge = () => {
                if (job.status === 'confirmed') {
                  return (
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-medium">
                      確定済
                    </span>
                  );
                }
                if (job.status === 'open') {
                  return (
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 font-medium">
                      募集中
                    </span>
                  );
                }
                return (
                  <span className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700 font-medium">
                    募集前
                  </span>
                );
              };

              return (
                <div key={job.id} onClick={() => onSelectJob(job.id)} className="p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {job.job_number && <span className="text-xl font-bold text-slate-900">{job.job_number}</span>}
                        <h3 className="text-lg font-semibold text-slate-900">
                          {job.title}
                        </h3>
                        {getStatusBadge()}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{job.inspection_date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{job.start_time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{job.prefecture} {job.city}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{job.inspector_count || 1}名</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {job.accommodation !== 'none' ? (
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
                    <div className="flex space-x-2 justify-end shrink-0 ml-4 w-32">
                      {applicationCount > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewApplications(job.id); }}
                          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
                        >
                          <Users className="w-4 h-4" />
                          <span>応募確認</span>
                        </button>
                      )}
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
