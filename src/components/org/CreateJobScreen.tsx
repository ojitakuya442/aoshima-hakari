import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { jobsApi, organizationsApi, filesApi } from '../../services/api';
import type { Job } from '../../lib/supabase';
import { AlertCircle, Upload, X, FileText, Copy, Check } from 'lucide-react';
import { REGIONS } from '../../lib/constants';

type Screen = 'org-dashboard' | 'org-create-job' | 'org-applications' | 'job-detail' | 'messages' | 'profile' | 'history' | 'notifications';

const TIME_OPTIONS_15MIN: string[] = (() => {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      opts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return opts;
})();

const roundUpTo15Min = (timeStr: string): string => {
  const [h, m] = timeStr.split(':').map(Number);
  const rounded = Math.ceil(m / 15) * 15;
  if (rounded === 60) {
    if (h >= 23) return '23:45';
    return `${String(h + 1).padStart(2, '0')}:00`;
  }
  return `${String(h).padStart(2, '0')}:${String(rounded).padStart(2, '0')}`;
};

const splitDateTimeLocal = (value: string): { date: string; time: string } => {
  if (!value) return { date: '', time: '' };
  const [date, time] = value.split('T');
  return { date: date || '', time: (time || '').slice(0, 5) };
};

const joinDateTimeLocal = (date: string, time: string): string => {
  if (!date && !time) return '';
  if (!date) return '';
  return `${date}T${time || '00:00'}`;
};

export function CreateJobScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [pastJobs, setPastJobs] = useState<Job[]>([]);
  const [loadingPast, setLoadingPast] = useState(false);
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateRegion, setTemplateRegion] = useState('all');
  const [templatePrefecture, setTemplatePrefecture] = useState('all');
  const [templateCity, setTemplateCity] = useState('');
  const [templateDateFrom, setTemplateDateFrom] = useState('');
  const [templateDateTo, setTemplateDateTo] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    inspection_date: '',
    start_time: '',
    location: '',
    prefecture: '東京都',
    city: '',
    reward: '',
    required_qualifications: '',
    visibility: 'local' as 'local' | 'public',
    inspector_count: '1',
    accommodation: 'none' as 'none' | 'before' | 'after' | 'both',
    machine_ssv: '0',
    machine_sv: '0',
    machine_other: '0',
    machine_old: '0',
    machine_certified: '0',
    machine_existing: '0',
    recruitment_start_date: '',
    recruitment_start_time: '09:00',
    file_access_level: 'public' as 'public' | 'confirmed',
    file_viewable_from: '',
    file_viewable_until: '',
  });

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const currentTimeStr = (() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  })();
  const recruitmentMinTime = formData.recruitment_start_date === todayStr ? roundUpTo15Min(currentTimeStr) : '';
  const recruitmentTimeOptions = recruitmentMinTime
    ? TIME_OPTIONS_15MIN.filter((t) => t >= recruitmentMinTime)
    : TIME_OPTIONS_15MIN;

  useEffect(() => {
    if (!showTemplateModal || !user) return;
    let cancelled = false;
    setLoadingPast(true);
    (async () => {
      try {
        const org = await organizationsApi.getByUserId(user.id);
        if (!org) {
          if (!cancelled) setPastJobs([]);
          return;
        }
        const jobs = await jobsApi.getByOrganization(org.id);
        if (cancelled) return;
        const past = jobs
          .filter((j) => j.inspection_date && j.inspection_date < todayStr)
          .sort((a, b) => b.inspection_date.localeCompare(a.inspection_date));
        setPastJobs(past);
      } catch (err) {
        console.error('Failed to load past jobs', err);
        if (!cancelled) setPastJobs([]);
      } finally {
        if (!cancelled) setLoadingPast(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showTemplateModal, user, todayStr]);

  const filteredPastJobs = useMemo(() => {
    const search = templateSearch.trim().toLowerCase();
    return pastJobs.filter((job) => {
      if (search) {
        const haystack = [job.title, job.description, job.job_number]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      if (templateRegion !== 'all') {
        const prefs = REGIONS[templateRegion] || [];
        if (!prefs.includes(job.prefecture || '')) return false;
      }
      if (templatePrefecture !== 'all' && job.prefecture !== templatePrefecture) return false;
      if (templateCity && !(job.city || '').includes(templateCity.trim())) return false;
      if (templateDateFrom && (!job.inspection_date || job.inspection_date < templateDateFrom)) return false;
      if (templateDateTo && (!job.inspection_date || job.inspection_date > templateDateTo)) return false;
      return true;
    });
  }, [pastJobs, templateSearch, templateRegion, templatePrefecture, templateCity, templateDateFrom, templateDateTo]);

  const resetTemplateFilters = () => {
    setTemplateSearch('');
    setTemplateRegion('all');
    setTemplatePrefecture('all');
    setTemplateCity('');
    setTemplateDateFrom('');
    setTemplateDateTo('');
  };

  const applyTemplate = (job: Job) => {
    setFormData((prev) => ({
      ...prev,
      title: job.title ?? '',
      description: job.description ?? '',
      location: job.location ?? '',
      prefecture: job.prefecture ?? prev.prefecture,
      city: job.city ?? '',
      reward: job.reward != null ? String(job.reward) : '',
      required_qualifications: job.required_qualifications ?? '',
      visibility: job.visibility === 'public' ? 'public' : 'local',
      inspector_count: job.inspector_count != null ? String(job.inspector_count) : '1',
      accommodation: job.accommodation ?? 'none',
      machine_ssv: String(job.machine_counts?.ssv ?? 0),
      machine_sv: String(job.machine_counts?.sv ?? 0),
      machine_other: String(job.machine_counts?.other ?? 0),
      machine_old: String(job.machine_counts?.old ?? 0),
      machine_certified: String(job.machine_counts?.certified ?? 0),
      machine_existing: String(job.machine_counts?.existing ?? 0),
    }));
    setAppliedTemplateId(job.id);
    setShowTemplateModal(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.mp4'];
      const invalidFiles = newFiles.filter(file => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        return !allowedExtensions.includes(ext);
      });

      if (invalidFiles.length > 0) {
        setError(`以下の形式のみアップロード可能です: PDF, Word, Excel, JPG, PNG, MP4`);
        return;
      }

      setSelectedFiles(prev => [...prev, ...newFiles]);
      setError('');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) throw new Error('Not authenticated');

      const recruitmentStart = new Date(`${formData.recruitment_start_date}T${formData.recruitment_start_time}`);
      if (!(recruitmentStart > new Date())) {
        throw new Error('募集開始日時は現在より後の日時を指定してください');
      }

      const org = await organizationsApi.getByUserId(user.id);
      if (!org) throw new Error('Organization not found');

      const job = await jobsApi.create({
        organization_id: org.id,
        title: formData.title,
        description: formData.description,
        inspection_date: formData.inspection_date,
        start_time: formData.start_time,
        location: formData.location,
        prefecture: formData.prefecture,
        city: formData.city,
        reward: parseInt(formData.reward),
        required_qualifications: formData.required_qualifications,
        visibility: formData.visibility,
        inspector_count: parseInt(formData.inspector_count),
        accommodation: formData.accommodation,
        accommodation_required: formData.accommodation !== 'none',
        machine_counts: {
          ssv: parseInt(formData.machine_ssv) || 0,
          sv: parseInt(formData.machine_sv) || 0,
          other: parseInt(formData.machine_other) || 0,
          old: parseInt(formData.machine_old) || 0,
          certified: parseInt(formData.machine_certified) || 0,
          existing: parseInt(formData.machine_existing) || 0,
        },
        recruitment_start_date: formData.recruitment_start_date,
        recruitment_start_time: formData.recruitment_start_time,
        status: 'pre-open',
      });

      if (!job) throw new Error('案件の作成に失敗しました');

      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        for (const file of selectedFiles) {
          try {
            await filesApi.uploadWithMetadata(file, job.id, user.id, {
              uploaded_by_role: 'organization',
              access_level: formData.file_access_level,
              file_category: 'recruitment',
              viewable_from: formData.file_viewable_from || null,
              viewable_until: formData.file_viewable_until || null,
            });
          } catch (fileError) {
            console.error('Failed to upload file:', file.name, fileError);
          }
        }
        setUploadingFiles(false);
      }

      onNavigate('org-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => onNavigate('org-dashboard')}
          className="text-slate-600 hover:text-slate-900 mb-4"
        >
          ← 戻る
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-slate-900">新規検定依頼作成</h1>
          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors text-sm text-slate-700"
          >
            <Copy className="w-4 h-4" />
            過去案件をテンプレートとして使用
          </button>
        </div>
        {appliedTemplateId && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-800">
            <Check className="w-3.5 h-3.5" />
            過去案件のテンプレートを反映しました。実施日・開始時間・募集開始日時は再入力が必要です。
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              検定業務名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="例: 建築物検定業務"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                募集開始日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.recruitment_start_date}
                onChange={(e) => {
                  const nextDate = e.target.value;
                  const minTime = nextDate === todayStr ? roundUpTo15Min(currentTimeStr) : '';
                  const nextTime = minTime && formData.recruitment_start_time < minTime
                    ? minTime
                    : formData.recruitment_start_time;
                  setFormData({ ...formData, recruitment_start_date: nextDate, recruitment_start_time: nextTime });
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                min={todayStr}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                募集開始時間 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.recruitment_start_time}
                onChange={(e) => setFormData({ ...formData, recruitment_start_time: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                required
              >
                {recruitmentTimeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="-mt-3 text-sm text-slate-500">
            現在より後の日時のみ指定できます。指定日時になると自動でお知らせが一斉送信され、募集が開始されます。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                実施日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.inspection_date}
                onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                開始時間 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                required
              >
                <option value="" disabled>選択してください</option>
                {TIME_OPTIONS_15MIN.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                都道府県 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.prefecture}
                onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                required
              >
                <option>東京都</option>
                <option>神奈川県</option>
                <option>千葉県</option>
                <option>埼玉県</option>
                <option>大阪府</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                市区町村 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="渋谷区"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              実施場所詳細 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="○○ 1-2-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              報酬 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="25000"
                required
                min="0"
              />
              <span className="text-slate-600">円</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              業務内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="検定業務の詳細内容を記載してください"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              公開範囲設定
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="local">地域限定公開</option>
              <option value="public">全体公開</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                必要な検定官人数 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.inspector_count}
                onChange={(e) => setFormData({ ...formData, inspector_count: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                宿泊
              </label>
              <select
                value={formData.accommodation}
                onChange={(e) => setFormData({ ...formData, accommodation: e.target.value as 'none' | 'before' | 'after' | 'both' })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="none">宿泊なし</option>
                <option value="before">前泊</option>
                <option value="after">後泊</option>
                <option value="both">前後泊</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              検定機械台数
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">SSV機</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={formData.machine_ssv}
                    onChange={(e) => setFormData({ ...formData, machine_ssv: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    min="0"
                  />
                  <span className="text-sm text-slate-600">台</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">SV機</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={formData.machine_sv}
                    onChange={(e) => setFormData({ ...formData, machine_sv: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    min="0"
                  />
                  <span className="text-sm text-slate-600">台</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">他社機</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={formData.machine_other}
                    onChange={(e) => setFormData({ ...formData, machine_other: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    min="0"
                  />
                  <span className="text-sm text-slate-600">台</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">旧型機</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={formData.machine_old}
                    onChange={(e) => setFormData({ ...formData, machine_old: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    min="0"
                  />
                  <span className="text-sm text-slate-600">台</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">内訳：型式指定</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={formData.machine_certified}
                    onChange={(e) => setFormData({ ...formData, machine_certified: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    min="0"
                  />
                  <span className="text-sm text-slate-600">台</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">内訳：既存</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={formData.machine_existing}
                    onChange={(e) => setFormData({ ...formData, machine_existing: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    min="0"
                  />
                  <span className="text-sm text-slate-600">台</span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              ※ 機械種別はクライアント確認後に確定予定。現状は仮の4種類で表示しています。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              検定資料のアップロード
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 mb-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                <div className="mt-4">
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors inline-block">
                      ファイルを選択
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4"
                    />
                  </label>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  PDF, Word, Excel, JPG, PNG, MP4形式のファイル
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-slate-700">選択されたファイル:</p>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-slate-600" />
                        <span className="text-sm text-slate-700">{file.name}</span>
                        <span className="text-xs text-slate-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  閲覧開始日時
                </label>
                {(() => {
                  const { date, time } = splitDateTimeLocal(formData.file_viewable_from);
                  return (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setFormData({ ...formData, file_viewable_from: joinDateTimeLocal(e.target.value, time) })}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                      />
                      <select
                        value={time}
                        onChange={(e) => setFormData({ ...formData, file_viewable_from: joinDateTimeLocal(date, e.target.value) })}
                        disabled={!date}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="">--:--</option>
                        {TIME_OPTIONS_15MIN.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  );
                })()}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  閲覧終了日時
                </label>
                {(() => {
                  const { date, time } = splitDateTimeLocal(formData.file_viewable_until);
                  return (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setFormData({ ...formData, file_viewable_until: joinDateTimeLocal(e.target.value, time) })}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                      />
                      <select
                        value={time}
                        onChange={(e) => setFormData({ ...formData, file_viewable_until: joinDateTimeLocal(date, e.target.value) })}
                        disabled={!date}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="">--:--</option>
                        {TIME_OPTIONS_15MIN.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  );
                })()}
              </div>
              <div className="md:col-span-2 text-sm text-slate-500 mt-[-8px]">
                ※ 未指定の場合は、案件作成時点から無期限で閲覧可能になります。<br/>
                ※ 後日追加アップロードも可能です。
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => onNavigate('org-dashboard')}
              className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || uploadingFiles}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400"
            >
              {uploadingFiles ? 'ファイルアップロード中...' : loading ? '作成中...' : '募集を予約して作成'}
            </button>
          </div>
        </div>
      </form>

      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">過去案件参照</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="閉じる"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto">
              <p className="text-sm text-slate-600 mb-4">
                過去の検定依頼案件を参照できます。また、実施場所・実施日などから絞り込むことも可能です。
              </p>
              {!loadingPast && pastJobs.length > 0 && (
                <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="検定業務名・案件番号で検索"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={templateRegion}
                      onChange={(e) => { setTemplateRegion(e.target.value); setTemplatePrefecture('all'); }}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    >
                      <option value="all">すべての地方</option>
                      {Object.keys(REGIONS).map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                    <select
                      value={templatePrefecture}
                      onChange={(e) => setTemplatePrefecture(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    >
                      <option value="all">すべての都道府県</option>
                      {(templateRegion === 'all' ? Object.values(REGIONS).flat() : REGIONS[templateRegion] || []).map((pref) => (
                        <option key={pref} value={pref}>{pref}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={templateCity}
                      onChange={(e) => setTemplateCity(e.target.value)}
                      placeholder="市区町村"
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent w-32"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">実施日</span>
                    <input
                      type="date"
                      value={templateDateFrom}
                      onChange={(e) => setTemplateDateFrom(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      max={templateDateTo || undefined}
                    />
                    <span className="text-slate-500 text-sm">〜</span>
                    <input
                      type="date"
                      value={templateDateTo}
                      onChange={(e) => setTemplateDateTo(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      min={templateDateFrom || undefined}
                    />
                    <button
                      type="button"
                      onClick={resetTemplateFilters}
                      className="ml-auto text-xs text-slate-600 hover:text-slate-900 underline"
                    >
                      絞り込みをリセット
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    {filteredPastJobs.length} / {pastJobs.length} 件
                  </p>
                </div>
              )}
              {loadingPast ? (
                <p className="text-sm text-slate-500 py-8 text-center">読み込み中...</p>
              ) : pastJobs.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">流用できる過去案件がありません。</p>
              ) : filteredPastJobs.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">該当する過去案件がありません。絞り込み条件を変更してください。</p>
              ) : (
                <ul className="space-y-2">
                  {filteredPastJobs.map((job) => (
                    <li key={job.id}>
                      <button
                        type="button"
                        onClick={() => applyTemplate(job)}
                        className="w-full text-left p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{job.title}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              実施日: {job.inspection_date} ／ {job.prefecture}{job.city}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              報酬: ¥{job.reward?.toLocaleString?.() ?? job.reward} ／ 検定官: {job.inspector_count ?? '-'}名
                            </p>
                          </div>
                          <Copy className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
