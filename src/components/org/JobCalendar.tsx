import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Job = {
  id: string;
  title: string;
  inspection_date: string;
  status: string;
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
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
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

          return (
            <button
              key={day}
              onClick={() => dayJobs.length > 0 && onSelectDate(dateStr, dayJobs)}
              className={`aspect-square p-2 rounded-lg border transition-colors ${
                dayJobs.length > 0
                  ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 cursor-pointer'
                  : 'border-slate-200 hover:bg-slate-50'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="text-sm font-medium text-slate-900">{day}</div>
              {dayJobs.length > 0 && (
                <div className="mt-1">
                  <div className="text-xs font-semibold text-blue-600">
                    {dayJobs.length}件
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
