import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { jobsApi, organizationsApi } from '../../services/api';
import { JobCalendar } from '../org/JobCalendar';

type Screen =
  | 'org-dashboard'
  | 'org-create-job'
  | 'org-applications'
  | 'inspector-dashboard'
  | 'job-detail'
  | 'messages'
  | 'profile'
  | 'history'
  | 'user-management'
  | 'calendar';

export function CalendarScreen({
  onSelectJob,
}: {
  onNavigate: (screen: Screen, jobId?: string) => void;
  onSelectJob: (jobId: string) => void;
}) {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);
  const [selectedDateJobs, setSelectedDateJobs] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user || !profile) return;
      try {
        let data: any[] = [];
        if (profile.role === 'organization') {
          const org = await organizationsApi.getByUserId(user.id);
          if (org) {
            data = await jobsApi.getByOrganization(org.id);
          }
        } else {
          data = await jobsApi.getAll();
        }
        setJobs(data || []);
        setSelectedDateJobs((data || []).filter((j: any) => j.inspection_date === todayStr));
      } catch (e) {
        console.error('Failed to load calendar jobs', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, profile, todayStr]);

  const handleDateSelect = (date: string, dateJobs: any[]) => {
    setSelectedDate(date);
    setSelectedDateJobs(dateJobs);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">カレンダー</h1>
      </div>

      <JobCalendar jobs={jobs} onSelectDate={handleDateSelect} selectedDate={selectedDate} />

      {selectedDateJobs && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            {selectedDate} の検定
          </h3>
          {selectedDateJobs.length > 0 ? (
            <div className="space-y-3">
              {selectedDateJobs.map((job) => {
                const isPast = job.inspection_date && job.inspection_date < todayStr;
                return (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job.id)}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {job.title}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {job.start_time} | {job.prefecture}{job.city} {job.location}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isPast && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700">
                          実施済
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          job.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : job.status === 'open'
                            ? 'bg-blue-100 text-blue-700'
                            : job.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {job.status === 'open'
                          ? '募集中'
                          : job.status === 'confirmed'
                          ? '確定済'
                          : job.status === 'draft'
                          ? '募集前'
                          : job.status === 'completed'
                          ? '実施済'
                          : job.status === 'cancelled'
                          ? '中止'
                          : job.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p>この日の検定依頼はありません</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
