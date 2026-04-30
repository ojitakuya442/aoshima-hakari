import { useMemo, useState } from 'react';
import {
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  Hotel,
  MapPin,
  Search,
  Send,
  ShieldCheck,
  Upload,
  UserRound,
  Users,
} from 'lucide-react';

type Role = 'organization' | 'inspector';
type Screen = 'dashboard' | 'jobs' | 'messages' | 'profile';
type JobStatus = 'open' | 'pending' | 'confirmed' | 'completed';

type Job = {
  id: string;
  title: string;
  organization: string;
  date: string;
  time: string;
  location: string;
  prefecture: string;
  reward: number;
  inspectors: number;
  accommodation: boolean;
  status: JobStatus;
  description: string;
  applications: number;
  files: string[];
};

const jobs: Job[] = [
  {
    id: 'J-2408',
    title: '建築物定期検査 立会い',
    organization: '青島計量検定センター',
    date: '2026-05-14',
    time: '09:00 - 16:00',
    location: '東京都港区芝公園',
    prefecture: '東京都',
    reward: 42000,
    inspectors: 2,
    accommodation: false,
    status: 'open',
    description: '商業施設の定期検査における現地確認、写真記録、検査チェックシートの提出を行います。',
    applications: 3,
    files: ['募集要項.pdf', '現地図面.pdf'],
  },
  {
    id: 'J-2409',
    title: '計量器更新後の初回検定',
    organization: '青島計量検定センター',
    date: '2026-05-18',
    time: '10:00 - 15:30',
    location: '神奈川県横浜市中区',
    prefecture: '神奈川県',
    reward: 36000,
    inspectors: 1,
    accommodation: false,
    status: 'pending',
    description: '新設された計量器の動作確認、証跡写真、検定結果の入力までを想定しています。',
    applications: 1,
    files: ['検定手順書.pdf'],
  },
  {
    id: 'J-2410',
    title: '大型倉庫設備 検査補助',
    organization: '東海検査協同組合',
    date: '2026-05-23',
    time: '08:30 - 17:30',
    location: '愛知県名古屋市港区',
    prefecture: '愛知県',
    reward: 68000,
    inspectors: 3,
    accommodation: true,
    status: 'confirmed',
    description: '複数名での設備確認。前日移動と宿泊を含むため、日程調整済みの検定官を優先します。',
    applications: 5,
    files: ['作業範囲.xlsx', '安全管理資料.pdf'],
  },
];

const applications = [
  { name: '山田 太郎', skill: '一級建築士 / 検定経験8年', status: '確認待ち', job: '建築物定期検査 立会い' },
  { name: '佐藤 美咲', skill: '設備検査 / 写真報告', status: '確定候補', job: '建築物定期検査 立会い' },
  { name: '田中 健', skill: '計量士 / 神奈川対応', status: '確認待ち', job: '計量器更新後の初回検定' },
];

const messages = [
  { from: '青島計量検定センター', text: '当日の集合場所は正面搬入口です。資料を更新しました。', mine: false },
  { from: 'あなた', text: '承知しました。開始前に現地担当者へ連絡します。', mine: true },
  { from: '青島計量検定センター', text: 'ありがとうございます。写真提出は当日18時まででお願いします。', mine: false },
];

const statusLabel: Record<JobStatus, string> = {
  open: '募集中',
  pending: '応募確認中',
  confirmed: '確定済み',
  completed: '完了',
};

const statusClass: Record<JobStatus, string> = {
  open: 'bg-blue-50 text-blue-700 ring-blue-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  completed: 'bg-slate-100 text-slate-700 ring-slate-200',
};

function App() {
  const [role, setRole] = useState<Role>('organization');
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState(jobs[0].id);
  const [query, setQuery] = useState('');

  const selectedJob = jobs.find((job) => job.id === selectedJobId) || jobs[0];
  const visibleJobs = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return jobs;
    return jobs.filter((job) =>
      [job.title, job.organization, job.location, job.prefecture].some((value) =>
        value.toLowerCase().includes(keyword)
      )
    );
  }, [query]);

  const stats = {
    open: jobs.filter((job) => job.status === 'open').length,
    pending: jobs.reduce((sum, job) => sum + job.applications, 0),
    confirmed: jobs.filter((job) => job.status === 'confirmed').length,
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button className="flex items-center gap-3" onClick={() => setScreen('dashboard')}>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <span className="text-lg font-bold">青島はかり 検定マッチング</span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {[
              ['dashboard', 'ダッシュボード'],
              ['jobs', role === 'organization' ? '検定依頼' : '募集案件'],
              ['messages', 'メッセージ'],
              ['profile', 'プロフィール'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setScreen(id as Screen)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  screen === id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="relative rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white">
                2
              </span>
            </button>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                onClick={() => setRole('organization')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  role === 'organization' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                機関
              </button>
              <button
                onClick={() => setRole('inspector')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  role === 'inspector' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                検定官
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {screen === 'dashboard' && (
          <Dashboard
            role={role}
            stats={stats}
            selectedJob={selectedJob}
            onShowJobs={() => setScreen('jobs')}
            onSelectJob={(id) => {
              setSelectedJobId(id);
              setScreen('jobs');
            }}
          />
        )}

        {screen === 'jobs' && (
          <JobsScreen
            role={role}
            jobs={visibleJobs}
            selectedJob={selectedJob}
            query={query}
            onQueryChange={setQuery}
            onSelectJob={setSelectedJobId}
          />
        )}

        {screen === 'messages' && <MessagesScreen />}

        {screen === 'profile' && <ProfileScreen role={role} />}
      </main>
    </div>
  );
}

function Dashboard({
  role,
  stats,
  selectedJob,
  onShowJobs,
  onSelectJob,
}: {
  role: Role;
  stats: { open: number; pending: number; confirmed: number };
  selectedJob: Job;
  onShowJobs: () => void;
  onSelectJob: (id: string) => void;
}) {
  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 rounded-lg bg-white p-6 shadow-sm md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {role === 'organization' ? '検定機関向けモック' : '検定官向けモック'}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950">
            {role === 'organization' ? '検定依頼の募集と応募確認' : '募集中案件の検索と応募'}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Supabaseや認証なしで、GitHub Pagesにそのまま公開できるフロント確認用の画面です。
          </p>
        </div>
        <button
          onClick={onShowJobs}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
        >
          <Briefcase className="h-5 w-5" />
          案件一覧を見る
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Briefcase} label="募集中" value={`${stats.open}件`} tone="blue" />
        <MetricCard icon={Users} label={role === 'organization' ? '応募数' : '応募可能'} value={`${stats.pending}件`} tone="amber" />
        <MetricCard icon={CheckCircle2} label="確定済み" value={`${stats.confirmed}件`} tone="emerald" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <h2 className="text-lg font-bold">直近の検定依頼</h2>
            <CalendarDays className="h-5 w-5 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-200">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className="flex w-full flex-col gap-3 p-5 text-left transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{job.title}</h3>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{job.date} / {job.location}</p>
                </div>
                <span className="text-sm font-semibold text-slate-900">¥{job.reward.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>

        <JobSummary job={selectedJob} />
      </section>
    </div>
  );
}

function JobsScreen({
  role,
  jobs,
  selectedJob,
  query,
  onQueryChange,
  onSelectJob,
}: {
  role: Role;
  jobs: Job[];
  selectedJob: Job;
  query: string;
  onQueryChange: (value: string) => void;
  onSelectJob: (id: string) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-lg bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h1 className="text-2xl font-bold">{role === 'organization' ? '検定依頼一覧' : '募集案件一覧'}</h1>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 outline-none ring-slate-300 focus:ring-2"
              placeholder="案件名・地域で検索"
            />
          </div>
        </div>
        <div className="divide-y divide-slate-200">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className={`w-full p-5 text-left transition hover:bg-slate-50 ${
                selectedJob.id === job.id ? 'bg-slate-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{job.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{job.organization}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                <InfoLine icon={CalendarDays} text={job.date} />
                <InfoLine icon={MapPin} text={job.prefecture} />
                <InfoLine icon={Users} text={`${job.inspectors}名`} />
                <InfoLine icon={Hotel} text={job.accommodation ? '宿泊あり' : '宿泊なし'} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <JobDetail role={role} job={selectedJob} />
        <ApplicationsPanel role={role} />
      </section>
    </div>
  );
}

function JobDetail({ role, job }: { role: Role; job: Job }) {
  return (
    <article className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start">
        <div>
          <StatusBadge status={job.status} />
          <h2 className="mt-3 text-2xl font-bold">{job.title}</h2>
          <p className="mt-1 text-slate-600">{job.organization}</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm text-slate-500">報酬</p>
          <p className="text-2xl font-bold">¥{job.reward.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-200 py-5 md:grid-cols-2">
        <InfoLine icon={CalendarDays} text={`${job.date} / ${job.time}`} />
        <InfoLine icon={MapPin} text={job.location} />
        <InfoLine icon={Users} text={`必要人数 ${job.inspectors}名`} />
        <InfoLine icon={Hotel} text={job.accommodation ? '宿泊あり' : '宿泊なし'} />
      </div>

      <div className="py-5">
        <h3 className="font-semibold">業務内容</h3>
        <p className="mt-2 leading-7 text-slate-700">{job.description}</p>
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">資料</h3>
          <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            {role === 'organization' ? '資料を追加' : '提出資料を追加'}
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {job.files.map((file) => (
            <div key={file} className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm">
              <FileText className="h-4 w-4 text-slate-500" />
              {file}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
          下書きとして確認
        </button>
        <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
          {role === 'organization' ? '応募者を確認' : 'この案件に応募'}
        </button>
      </div>
    </article>
  );
}

function ApplicationsPanel({ role }: { role: Role }) {
  if (role === 'inspector') {
    return (
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">応募ステータス</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <SmallStatus label="応募済み" value="2件" />
          <SmallStatus label="確認待ち" value="1件" />
          <SmallStatus label="確定済み" value="1件" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold">応募者候補</h2>
      <div className="mt-4 space-y-3">
        {applications.map((application) => (
          <div key={application.name} className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <UserRound className="h-5 w-5 text-slate-600" />
              </span>
              <div>
                <p className="font-semibold">{application.name}</p>
                <p className="text-sm text-slate-600">{application.skill}</p>
              </div>
            </div>
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              確認
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function MessagesScreen() {
  return (
    <section className="grid min-h-[620px] overflow-hidden rounded-lg bg-white shadow-sm lg:grid-cols-[320px_1fr]">
      <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
        <div className="border-b border-slate-200 p-5">
          <h1 className="text-2xl font-bold">メッセージ</h1>
        </div>
        {jobs.map((job) => (
          <button key={job.id} className="w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50">
            <p className="font-semibold">{job.title}</p>
            <p className="mt-1 truncate text-sm text-slate-600">{job.organization}</p>
          </button>
        ))}
      </aside>
      <div className="flex flex-col">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold">建築物定期検査 立会い</h2>
          <p className="text-sm text-slate-600">青島計量検定センター</p>
        </div>
        <div className="flex-1 space-y-4 bg-slate-50 p-5">
          {messages.map((message) => (
            <div key={message.text} className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl rounded-lg p-3 ${message.mine ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 shadow-sm'}`}>
                {!message.mine && <p className="mb-1 text-xs font-semibold text-slate-500">{message.from}</p>}
                <p>{message.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 p-4">
          <div className="flex gap-2">
            <input className="flex-1 rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" placeholder="メッセージを入力" />
            <button className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700">
              <Send className="h-4 w-4" />
              送信
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileScreen({ role }: { role: Role }) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">プロフィール</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="rounded-lg bg-slate-50 p-5 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm">
            {role === 'organization' ? <Building2 className="h-10 w-10 text-slate-600" /> : <UserRound className="h-10 w-10 text-slate-600" />}
          </div>
          <p className="mt-4 font-bold">{role === 'organization' ? '青島計量検定センター' : '山田 太郎'}</p>
          <p className="text-sm text-slate-600">{role === 'organization' ? '検定機関' : '検定官'}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <MockField label={role === 'organization' ? '組織名' : '氏名'} value={role === 'organization' ? '青島計量検定センター' : '山田 太郎'} />
          <MockField label="メールアドレス" value={role === 'organization' ? 'org@example.com' : 'inspector@example.com'} />
          <MockField label="電話番号" value="03-1234-5678" />
          <MockField label="対応エリア" value="東京都 / 神奈川県 / 千葉県" />
          <div className="md:col-span-2">
            <MockField label={role === 'organization' ? '組織概要' : '保有資格・経験'} value={role === 'organization' ? '計量器、建築物、設備検査の検定依頼を管理しています。' : '一級建築士、計量士。現地検査と報告書作成の経験があります。'} />
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
  tone: 'blue' | 'amber' | 'emerald';
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
        <span className={`flex h-12 w-12 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </div>
  );
}

function JobSummary({ job }: { job: Job }) {
  return (
    <aside className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold">次の確定候補</h2>
      <div className="mt-4 rounded-lg bg-slate-50 p-4">
        <StatusBadge status={job.status} />
        <h3 className="mt-3 font-bold">{job.title}</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <InfoLine icon={CalendarDays} text={`${job.date} / ${job.time}`} />
          <InfoLine icon={MapPin} text={job.location} />
          <InfoLine icon={Users} text={`${job.applications}件の応募`} />
        </div>
      </div>
    </aside>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass[status]}`}>
      {statusLabel[status]}
    </span>
  );
}

function InfoLine({ icon: Icon, text }: { icon: typeof CalendarDays; text: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <span className="truncate">{text}</span>
    </span>
  );
}

function SmallStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <input
        value={value}
        readOnly
        className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900"
      />
    </label>
  );
}

export default App;
