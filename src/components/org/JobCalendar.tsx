import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Job = {
  id: string;
  title: string;
  inspection_date: string;
  status: string;
  prefecture?: string;
};

const getColorForJob = (job: Job) => {
  const colors = [
    'bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 
    'bg-amber-500', 'bg-purple-500', 'bg-cyan-500',
    'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
  ];
  let hash = 0;
  const str = job.id || job.title;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function JobCalendar({
  jobs,
  onSelectDate,
}: {
  jobs: Job[];
  onSelectDate: (date: string, jobs: Job[]) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getJobsForDate = (dateStr: string) => {
    return jobs.filter((job) => job.inspection_date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">{monthName}</h2>
        <div className="flex space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, idx) => (
          <div key={day} className={`text-center text-sm font-semibold py-2 ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-600'}`}>
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayJobs = getJobsForDate(dateStr);
          const isToday =
            day === new Date().getDate() &&
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear();
            
          const isSunday = index % 7 === 0;
          const isSaturday = index % 7 === 6;
          const dayColor = isSunday ? 'text-red-600' : isSaturday ? 'text-blue-600' : 'text-slate-900';

          return (
            <button
              key={day}
              onClick={() => dayJobs.length > 0 && onSelectDate(dateStr, dayJobs)}
              className={`min-h-[100px] p-2 rounded-lg border transition-colors text-left flex flex-col ${
                dayJobs.length > 0
                  ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 cursor-pointer'
                  : 'border-slate-200 hover:bg-slate-50'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className={`text-sm font-medium ${dayColor} mb-1`}>{day}</div>
              {dayJobs.length > 0 && (
                <div className="flex-1 flex flex-col gap-1 w-full overflow-hidden">
                  {dayJobs.slice(0, 2).map(job => (
                    <div 
                      key={job.id} 
                      className={`text-[10px] leading-tight px-1.5 py-1 rounded truncate text-white ${getColorForJob(job)}`}
                      title={job.title}
                    >
                      {job.title}
                    </div>
                  ))}
                  {dayJobs.length > 2 && (
                    <div className="text-[10px] font-semibold text-slate-500 mt-auto pl-1">
                      ＋他 {dayJobs.length - 2} 件
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
