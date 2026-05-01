import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, DollarSign, FileText, Check, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { jobsApi, applicationsApi, inspectorsApi } from '../../services/api';
import { REGIONS } from '../../lib/constants';

type Screen = 'org-dashboard' | 'org-create-job' | 'org-applications' | 'inspector-dashboard' | 'job-detail' | 'messages' | 'profile' | 'history' | 'notifications';

export function InspectorDashboard({
  onNavigate,
  onSelectJob,
}: {
  onNavigate: (screen: Screen) => void;
  onSelectJob: (jobId: string) => void;
}) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterPrefecture, setFilterPrefecture] = useState('all');
  const [filterCity, setFilterCity] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSort, setFilterSort] = useState('created_desc');
  const [stats, setStats] = useState({ draft: 0, open: 0, confirmed: 0 });
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [applicationStatuses, setApplicationStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [jobsData, inspector] = await Promise.all([
        jobsApi.getAll(),
        inspectorsApi.getByUserId(user.id),
      ]);

      setJobs(jobsData || []);

      if (inspector) {
        const applicationsData = await applicationsApi.getByInspector(inspector.id);
        const pendingCount = applicationsData?.filter((a) => a.status === 'pending').length || 0;
        const confirmedCount = applicationsData?.filter((a) => a.status === 'confirmed').length || 0;

        const appliedIds = new Set(applicationsData?.map((a: any) => a.job_id) || []);
        setAppliedJobIds(appliedIds);

        const statuses: Record<string, string> = {};
        applicationsData?.forEach((a: any) => {
          statuses[a.job_id] = a.status;
        });
        setApplicationStatuses(statuses);

        const draftCount = (jobsData || []).filter((job: any) => job.status === 'draft').length;
        const openCount = (jobsData || []).filter((job: any) => job.status === 'open').length;
        const confirmedJobCount = (jobsData || []).filter((job: any) => job.status === 'confirmed').length;

        setStats({ draft: draftCount, open: openCount, confirmed: confirmedJobCount });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (searchTerm && !(job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.description.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
    if (filterRegion !== 'all') {
      const prefecturesInRegion = REGIONS[filterRegion] || [];
      if (!prefecturesInRegion.includes(job.prefecture)) return false;
    }
    if (filterPrefecture !== 'all' && job.prefecture !== filterPrefecture) return false;
    if (filterCity && !job.city?.includes(filterCity)) return false;
    if (filterStatus !== 'all' && job.status !== filterStatus) return false;
    // Don't show jobs that are already completed or cancelled by default, unless maybe filtered?
    if (filterStatus === 'all' && ['completed', 'cancelled'].includes(job.status)) return false;
    return true;
  }).sort((a, b) => {
    if (filterSort === 'inspection_asc') return a.inspection_date.localeCompare(b.inspection_date);
    if (filterSort === 'inspection_desc') return b.inspection_date.localeCompare(a.inspection_date);
    if (filterSort === 'created_desc') return b.created_at.localeCompare(a.created_at);
    return 0;
  });

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
        <h1 className="text-3xl font-bold text-slate-900 mb-4">検定官ダッシュボード</h1>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="キーワードで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRegion}
            onChange={(e) => {
              setFilterRegion(e.target.value);
              setFilterPrefecture('all');
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="all">すべての地方</option>
            {Object.keys(REGIONS).map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          <select
            value={filterPrefecture}
            onChange={(e) => setFilterPrefecture(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent w-40"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="all">すべてのステータス</option>
            <option value="draft">募集前</option>
            <option value="open">募集中</option>
            <option value="confirmed">確定済み</option>
          </select>
          <select
            value={filterSort}
            onChange={(e) => setFilterSort(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="created_desc">新着順</option>
            <option value="inspection_asc">開催日が近い順</option>
            <option value="inspection_desc">開催日が遠い順</option>
          </select>
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
              <p className="text-sm text-slate-600 mb-1">確定済み</p>
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
          <h2 className="text-xl font-bold text-slate-900">募集中の検定業務</h2>
        </div>
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            現在募集中の案件はありません
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredJobs.map((job) => {
              const applicationStatus = applicationStatuses[job.id];
              const getStatusBadge = () => {
                if (applicationStatus === 'confirmed') {
                  return (
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-medium">
                      確定済み
                    </span>
                  );
                } else if (applicationStatus === 'pending') {
                  return (
                    <span className="px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700 font-medium">
                      応募待ち
                    </span>
                  );
                } else if (applicationStatus === 'rejected') {
                  return (
                    <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 font-medium">
                      辞退済み
                    </span>
                  );
                } else {
                  if (job.status === 'draft') {
                    return (
                      <span className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700 font-medium">
                        募集前
                      </span>
                    );
                  }
                  return (
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 font-medium">
                      募集中
                    </span>
                  );
                }
              };

              return (
                <div key={job.id} onClick={() => onSelectJob(job.id)} className="p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {job.job_number && <span className="text-sm text-slate-500 mr-2">{job.job_number}</span>}
                          {job.title}
                        </h3>
                        {getStatusBadge()}
                      </div>
                      <p className="text-sm text-slate-600 mb-3">
                        {job.organizations?.organization_name}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{job.inspection_date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{job.start_time} - {job.end_time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{job.prefecture} {job.city || ''}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-slate-900">
                            ¥{job.reward.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectJob(job.id); }}
                      className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      詳細
                    </button>
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
