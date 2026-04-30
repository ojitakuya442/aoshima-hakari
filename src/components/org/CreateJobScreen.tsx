import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { jobsApi, organizationsApi, filesApi } from '../../services/api';
import { AlertCircle, Upload, X, FileText } from 'lucide-react';

type Screen = 'org-dashboard' | 'org-create-job' | 'org-applications' | 'job-detail' | 'messages' | 'profile' | 'history' | 'notifications';

export function CreateJobScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    inspection_date: '',
    start_time: '',
    end_time: '',
    location: '',
    prefecture: '東京都',
    city: '',
    reward: '',
    required_qualifications: '',
    visibility: 'local' as 'local' | 'public' | 'progressive',
    inspector_count: '1',
    accommodation_required: false,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.mp4', '.exe'];
      const invalidFiles = newFiles.filter(file => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        return !allowedExtensions.includes(ext);
      });

      if (invalidFiles.length > 0) {
        setError(`以下の形式のみアップロード可能です: PDF, Word, JPG, PNG, MP4, EXE`);
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

      const org = await organizationsApi.getByUserId(user.id);
      if (!org) throw new Error('Organization not found');

      const job = await jobsApi.create({
        organization_id: org.id,
        title: formData.title,
        description: formData.description,
        inspection_date: formData.inspection_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location,
        prefecture: formData.prefecture,
        city: formData.city,
        reward: parseInt(formData.reward),
        required_qualifications: formData.required_qualifications,
        visibility: formData.visibility,
        inspector_count: parseInt(formData.inspector_count),
        accommodation_required: formData.accommodation_required,
        status: 'open',
      });

      if (!job) throw new Error('案件の作成に失敗しました');

      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        for (const file of selectedFiles) {
          try {
            await filesApi.uploadWithMetadata(file, job.id, user.id, {
              uploaded_by_role: 'organization',
              access_level: 'public',
              file_category: 'recruitment',
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
        <h1 className="text-3xl font-bold text-slate-900">新規検定依頼作成</h1>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                終了時間 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                required
              />
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
              <option value="progressive">段階的拡大公開</option>
            </select>
            <p className="mt-2 text-sm text-slate-500">
              段階的拡大公開を選択すると、応募が集まらない場合に自動で公開範囲が拡大されます
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              必要資格・スキル
            </label>
            <input
              type="text"
              value={formData.required_qualifications}
              onChange={(e) => setFormData({ ...formData, required_qualifications: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="例: 建築士資格、検定経験3年以上"
            />
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
              <div className="flex items-center h-full">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.accommodation_required}
                    onChange={(e) => setFormData({ ...formData, accommodation_required: e.target.checked })}
                    className="w-5 h-5 text-slate-700 border-slate-300 rounded focus:ring-2 focus:ring-slate-500"
                  />
                  <span className="text-slate-700">宿泊が必要</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              検定資料のアップロード（募集期間中から閲覧可能）
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
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
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.exe"
                    />
                  </label>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  PDF, Word, JPG, PNG, MP4, EXE形式のファイル
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
            <p className="mt-2 text-sm text-slate-500">
              後日追加アップロードも可能です
            </p>
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
              {uploadingFiles ? 'ファイルアップロード中...' : loading ? '作成中...' : '募集を開始'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
