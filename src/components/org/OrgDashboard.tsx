import { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users, Hotel, Briefcase, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { jobsApi, organizationsApi, applicationsApi } from '../../services/api';
import { JobCalendar } from './JobCalendar';

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
  const [stats, setStats] = useState({ recruiting: 0, pending: 0, confirmed: 0 });
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateJobs, setSelectedDateJobs] = useState<any[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const org = await organizationsApi.getByUserId(user.id);
      if (org) {
        const jobsData = await jobsApi.getByOrganization(org.id);
        setJobs(jobsData || []);

        const counts: Record<string, number> = {};
        let totalPending = 0;

        for (const job of jobsData || []) {
          const apps = await applicationsApi.getByJob(job.id);
          const pendingApps = apps?.filter((a) => a.status === 'pending').length || 0;
          counts[job.id] = pendingApps;
          totalPending += pendingApps;
        }

        setJobApplicationCounts(counts);

        const recruitingCount = jobsData?.filter((j) => j.status === 'open').length || 0;
        const confirmedCount = jobsData?.filter((j) => j.status === 'confirmed').length || 0;

        setStats({ recruiting: recruitingCount, pending: totalPending, confirmed: confirmedCount });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string, dateJobs: any[]) => {
    setSelectedDate(date);
    setSelectedDateJobs(dateJobs);
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
        <h1 className="text-3xl font-bold text-slate-900">検定依頼管理</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
              showCalendar
                ? 'bg-slate-200 text-slate-700'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span>カレンダー</span>
          </button>
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

      {showCalendar && (
        <div className="mb-8">
          <JobCalendar jobs={jobs} onSelectDate={handleDateSelect} />
          {selectedDateJobs && selectedDateJobs.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                {selectedDate} の検定
              </h3>
              <div className="space-y-3">
                {selectedDateJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900">{job.title}</h4>
                      <p className="text-sm text-slate-600">
                        {job.start_time} - {job.end_time} | {job.location}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          job.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : job.status === 'open'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {job.status === 'open' ? '募集中' : job.status === 'confirmed' ? '確定済み' : job.status}
                      </span>
                      <button
                        onClick={() => onSelectJob(job.id)}
                        className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                      >
                        詳細
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">検定依頼一覧</h2>
        </div>
        {jobs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            検定依頼がまだありません。新規作成してください。
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {jobs.map((job) => {
              const applicationCount = jobApplicationCounts[job.id] || 0;
              const getStatusBadge = () => {
                if (job.status === 'confirmed') {
                  return (
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-medium">
                      確定済み
                    </span>
                  );
                } else if (job.status === 'open') {
                  return (
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 font-medium">
                      募集中
                    </span>
                  );
                } else if (job.status === 'completed') {
                  return (
                    <span className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700 font-medium">
                      完了
                    </span>
                  );
                } else if (job.status === 'cancelled') {
                  return (
                    <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 font-medium">
                      キャンセル
                    </span>
                  );
                } else {
                  return (
                    <span className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700 font-medium">
                      {job.status}
                    </span>
                  );
                }
              };

              return (
                <div key={job.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                        {getStatusBadge()}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{job.inspection_date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{job.start_time} - {job.end_time}</span>
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
                          {job.accommodation_required ? (
                            <>
                              <Hotel className="w-4 h-4 text-blue-600" />
                              <span className="text-blue-600">宿泊あり</span>
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
                    <div className="flex space-x-2">
                      {applicationCount > 0 && (
                        <button
                          onClick={() => handleViewApplications(job.id)}
                          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
                        >
                          <Users className="w-4 h-4" />
                          <span>応募確認</span>
                        </button>
                      )}
                      <button
                        onClick={() => onSelectJob(job.id)}
                        className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        詳細
                      </button>
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
