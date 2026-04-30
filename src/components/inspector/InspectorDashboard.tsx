import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, DollarSign, FileText, Check, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { jobsApi, applicationsApi, inspectorsApi } from '../../services/api';

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
  const [selectedPrefecture, setSelectedPrefecture] = useState('すべての地域');
  const [stats, setStats] = useState({ recruiting: 0, pending: 0, confirmed: 0 });
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [applicationStatuses, setApplicationStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [user, selectedPrefecture]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [jobsData, inspector] = await Promise.all([
        jobsApi.getOpenJobs(selectedPrefecture === 'すべての地域' ? undefined : selectedPrefecture),
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

        const recruitingCount = (jobsData || []).filter((job: any) => !appliedIds.has(job.id)).length;

        setStats({ recruiting: recruitingCount, pending: pendingCount, confirmed: confirmedCount });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="キーワードで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedPrefecture}
            onChange={(e) => setSelectedPrefecture(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option>すべての地域</option>
            <option>東京都</option>
            <option>神奈川県</option>
            <option>千葉県</option>
            <option>埼玉県</option>
            <option>大阪府</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">募集中</p>
              <p className="text-3xl font-bold text-slate-900">{stats.recruiting}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">応募待ち</p>
              <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
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
                  return (
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 font-medium">
                      募集中
                    </span>
                  );
                }
              };

              return (
                <div key={job.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
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
                          <span>{job.prefecture}</span>
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
                      onClick={() => onSelectJob(job.id)}
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
