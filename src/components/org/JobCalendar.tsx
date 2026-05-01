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
  const [isEditingHolidays, setIsEditingHolidays] = useState(false);
  const [customHolidays, setCustomHolidays] = useState<Record<string, string>>({});
  const [holidayModal, setHolidayModal] = useState<{ isOpen: boolean; dateStr: string; } | null>(null);
  const [holidayName, setHolidayName] = useState('休業日');

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
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-slate-900">{monthName}</h2>
          <button
            onClick={() => setIsEditingHolidays(!isEditingHolidays)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              isEditingHolidays
                ? 'bg-red-50 text-red-600 border-red-200 font-medium'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isEditingHolidays ? '休業日設定 終了' : '休業日設定'}
          </button>
        </div>
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
          const holidayName = customHolidays[dateStr];
          const isHoliday = isSunday || !!holidayName;
          const dayColor = isHoliday ? 'text-red-600' : isSaturday ? 'text-blue-600' : 'text-slate-900';
          const bgColor = isHoliday ? 'bg-red-50' : 'bg-white';

          const handleDayClick = () => {
            if (isEditingHolidays) {
              if (customHolidays[dateStr]) {
                setCustomHolidays(prev => {
                  const newHolidays = { ...prev };
                  delete newHolidays[dateStr];
                  return newHolidays;
                });
              } else {
                setHolidayName('休業日');
                setHolidayModal({ isOpen: true, dateStr });
              }
            } else if (dayJobs.length > 0) {
              onSelectDate(dateStr, dayJobs);
            }
          };

          return (
            <button
              key={day}
              onClick={handleDayClick}
              className={`min-h-[100px] p-2 rounded-lg border transition-colors text-left flex flex-col relative ${
                isEditingHolidays
                  ? 'hover:border-red-400 cursor-pointer'
                  : dayJobs.length > 0
                  ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 cursor-pointer'
                  : 'border-slate-200 hover:bg-slate-50'
              } ${isToday ? 'ring-2 ring-blue-500' : ''} ${bgColor}`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className={`text-lg font-bold ${dayColor}`}>{day}</div>
                {holidayName && (
                  <div className="text-[10px] text-red-600 bg-red-100 px-1 rounded truncate max-w-[60%]">
                    {holidayName}
                  </div>
                )}
              </div>
              {dayJobs.length > 0 && !isEditingHolidays && (
                <div className="flex-1 flex flex-col gap-1 w-full overflow-hidden mt-1">
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

      {holidayModal?.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">休業日設定</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                休業日の名前を入力してください（例：夏期休暇）
              </label>
              <input
                type="text"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && holidayName.trim()) {
                    setCustomHolidays(prev => ({ ...prev, [holidayModal.dateStr]: holidayName.trim() }));
                    setHolidayModal(null);
                  } else if (e.key === 'Escape') {
                    setHolidayModal(null);
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setHolidayModal(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  if (holidayName.trim()) {
                    setCustomHolidays(prev => ({ ...prev, [holidayModal.dateStr]: holidayName.trim() }));
                    setHolidayModal(null);
                  }
                }}
                disabled={!holidayName.trim()}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                設定する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
