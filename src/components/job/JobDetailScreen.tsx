import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, DollarSign, FileText, AlertCircle, Download, Upload, ExternalLink, Camera, X, Users, Hotel } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { jobsApi, applicationsApi, inspectorsApi, auditLogsApi, filesApi } from '../../services/api';
import { supabase } from '../../lib/supabase';

type Screen = 'org-dashboard' | 'org-create-job' | 'org-applications' | 'inspector-dashboard' | 'job-detail' | 'messages' | 'profile' | 'history' | 'notifications';

export function JobDetailScreen({
  jobId,
  onNavigate,
}: {
  jobId: string | null;
  onNavigate: (screen: Screen) => void;
}) {
  const { user, profile } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    if (!jobId) return;

    try {
      const jobData = await jobsApi.getById(jobId);
      setJob(jobData);

      if (profile?.role === 'inspector' && user) {
        const inspector = await inspectorsApi.getByUserId(user.id);
        if (inspector) {
          const applications = await applicationsApi.getByJob(jobId);
          const userApp = applications?.find((a: any) => a.inspector_id === inspector.id);
          setHasApplied(!!userApp);
          setApplicationId(userApp?.id || null);
          setApplicationStatus(userApp?.status || null);
        }
      }

      await loadFiles();
    } catch (error) {
      console.error('Failed to load job:', error);
      setError('案件の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    if (!jobId) return;

    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (profile?.role === 'inspector' && user) {
        const inspector = await inspectorsApi.getByUserId(user.id);
        if (inspector) {
          const applications = await applicationsApi.getByJob(jobId);
          const userApp = applications?.find((a: any) => a.inspector_id === inspector.id);
          const confirmed = userApp && userApp.status === 'confirmed';
          setIsConfirmed(Boolean(confirmed));

          const accessibleFiles = data?.filter((file: any) => {
            if (file.uploaded_by_role === 'inspector' && file.uploader_id === user.id) {
              return true;
            }
            if (file.uploaded_by_role === 'organization') {
              if (file.access_level === 'public') return true;
              if (file.access_level === 'confirmed' && confirmed) return true;
            }
            return false;
          });
          setFiles(accessibleFiles || []);
        }
      } else {
        setFiles(data || []);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

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

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleApply = async () => {
    if (!user || !jobId) return;

    setApplying(true);
    setError('');

    try {
      const inspector = await inspectorsApi.getByUserId(user.id);
      if (!inspector) throw new Error('Inspector profile not found');

      const application = await applicationsApi.create({
        job_id: jobId,
        inspector_id: inspector.id,
        message: applicationMessage,
      });

      try {
        await auditLogsApi.create({
          action: 'apply',
          action_type: 'application',
          entity_type: 'application',
          entity_id: application?.id,
          details: {
            job_id: jobId,
            inspector_id: inspector.id,
          },
        });
      } catch (logError) {
        console.error('Failed to log apply action:', logError);
      }

      setHasApplied(true);
      setApplicationMessage('');
      setApplicationId(application?.id || null);
      setApplicationStatus('pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : '応募に失敗しました');
    } finally {
      setApplying(false);
    }
  };

  const handleWithdraw = async () => {
    if (!applicationId || !user) return;

    if (!confirm('応募を取り下げますか？')) return;

    setApplying(true);
    setError('');

    try {
      await applicationsApi.withdraw(applicationId);

      try {
        await auditLogsApi.create({
          action: 'withdraw',
          action_type: 'application',
          entity_type: 'application',
          entity_id: applicationId,
          details: {
            job_id: jobId,
          },
        });
      } catch (logError) {
        console.error('Failed to log withdraw action:', logError);
      }

      setHasApplied(false);
      setApplicationId(null);
      setApplicationStatus(null);
      setApplicationMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '応募の取り下げに失敗しました');
    } finally {
      setApplying(false);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0 || !user || !jobId) return;

    setUploading(true);
    setError('');

    try {
      for (const file of selectedFiles) {
        setUploadProgress(`${file.name}をアップロード中...`);

        const metadata = {
          uploaded_by_role: profile?.role as 'organization' | 'inspector',
          access_level: profile?.role === 'organization' ? 'public' as const : 'confirmed' as const,
          file_category: profile?.role === 'organization' ? 'recruitment' as const : 'submission' as const,
        };

        await filesApi.uploadWithMetadata(file, jobId, user.id, metadata);
      }

      await loadFiles();
      setSelectedFiles([]);
      setUploadProgress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ファイルのアップロードに失敗しました');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ダウンロードに失敗しました');
    }
  };

  const openInMaps = () => {
    if (!job) return;
    const address = `${job.prefecture}${job.city}${job.location}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  const handleDownloadInspectionMaterial = () => {
    // 検定資料のダウンロード（形式的な実装）
    const dummyContent = `検定業務マニュアル

案件名: ${job.title}
実施日: ${job.inspection_date}
実施時間: ${job.start_time} 〜 ${job.end_time}
実施場所: ${job.prefecture} ${job.city} ${job.location}

【検定手順】
1. 現地に到着したら、担当者に連絡してください
2. 必要な書類を確認してください
3. 検定作業を実施してください
4. 写真を撮影し、システムにアップロードしてください
5. 報告書を作成してください

【注意事項】
- 安全第一で作業を行ってください
- 疑問点があれば担当者に確認してください
- 完了後は速やかに報告してください`;

    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `検定資料_${job.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-slate-500">案件が見つかりません</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() =>
            onNavigate(
              profile?.role === 'organization' ? 'org-dashboard' : 'inspector-dashboard'
            )
          }
          className="text-slate-600 hover:text-slate-900 mb-4"
        >
          ← 戻る
        </button>
        <h1 className="text-3xl font-bold text-slate-900">検定業務詳細</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-8 mb-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{job.title}</h2>
            <p className="text-slate-600">{job.organizations?.organization_name}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              job.status === 'open'
                ? 'bg-blue-100 text-blue-700'
                : job.status === 'closed'
                ? 'bg-slate-100 text-slate-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {job.status === 'open' ? '募集中' : job.status === 'closed' ? '募集終了' : '完了'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">実施日</p>
                <p className="font-semibold text-slate-900">{job.inspection_date}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">実施時間</p>
                <p className="font-semibold text-slate-900">
                  {job.start_time} 〜 {job.end_time}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-600">実施場所</p>
                <button
                  onClick={openInMaps}
                  className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-left group flex items-center space-x-2"
                >
                  <span>{job.prefecture} {job.city}</span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <p className="text-sm text-slate-600 mt-1">{job.location}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">報酬</p>
                <p className="text-2xl font-bold text-slate-900">
                  ¥{job.reward.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">必要人数</p>
                <p className="font-semibold text-slate-900">
                  {job.inspector_count}名
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Hotel className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">宿泊</p>
                <p className={`font-semibold ${job.accommodation_required ? 'text-blue-600' : 'text-slate-900'}`}>
                  {job.accommodation_required ? '宿泊あり' : '宿泊なし'}
                </p>
              </div>
            </div>
            {job.required_qualifications && (
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">必要資格</p>
                  <p className="font-semibold text-slate-900">
                    {job.required_qualifications}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">業務内容</h3>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">検定マニュアル</h3>
          <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-slate-600" />
              <div>
                <p className="font-medium text-slate-900">検定業務マニュアル</p>
                <p className="text-sm text-slate-600">検定の手順と注意事項</p>
              </div>
            </div>
            <button
              onClick={handleDownloadInspectionMaterial}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>ダウンロード</span>
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">
              {profile?.role === 'inspector' ? '提出資料アップロード' : '案件資料'}
            </h3>
          </div>

          {profile?.role === 'inspector' && (
            <div className="mb-4">
              {!isConfirmed && (
                <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  承認後に組織が指定した資料をダウンロードできます
                </div>
              )}
              {isConfirmed && (
                <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                  承認されました。すべての資料にアクセスできます
                </div>
              )}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors inline-block">
                      ファイルを選択
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      disabled={uploading}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.exe"
                    />
                  </label>
                  <p className="mt-2 text-sm text-slate-500">
                    PDF, Word, JPG, PNG, MP4, EXE形式
                  </p>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-slate-700">選択されたファイル:</p>
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded border border-slate-200"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-slate-600" />
                          <span className="text-sm text-slate-700">{file.name}</span>
                          <span className="text-xs text-slate-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleFileUpload}
                      disabled={uploading}
                      className="w-full mt-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400"
                    >
                      {uploading ? 'アップロード中...' : 'アップロード'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {uploadProgress && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              {uploadProgress}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-700 mb-2">
              {profile?.role === 'inspector' ? 'アクセス可能なファイル' : 'アップロード済みファイル'}
            </h4>
            {files.length === 0 ? (
              <p className="text-slate-500 text-sm">まだファイルはありません</p>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {file.file_name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <span>{(file.file_size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{new Date(file.created_at).toLocaleDateString('ja-JP')}</span>
                        {file.file_category && (
                          <>
                            <span>•</span>
                            <span className={`px-2 py-0.5 rounded ${
                              file.file_category === 'recruitment'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {file.file_category === 'recruitment' ? '募集資料' : '提出資料'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(file)}
                    className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-white transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>DL</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {profile?.role === 'inspector' && job.status === 'open' && (
          <div className="border-t border-slate-200 pt-6">
            {hasApplied ? (
              <div>
                {applicationStatus === 'confirmed' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-semibold">確定済みです</p>
                    <p className="text-sm text-green-700 mt-1">検定機関から承認されました</p>
                  </div>
                ) : applicationStatus === 'rejected' ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-semibold">辞退されました</p>
                    <p className="text-sm text-red-700 mt-1">検定機関から辞退されました</p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-semibold">応募済みです</p>
                    <p className="text-sm text-blue-700 mt-1">検定機関からの返答をお待ちください</p>
                    <button
                      onClick={handleWithdraw}
                      disabled={applying}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                    >
                      {applying ? '処理中...' : '応募を取り下げる'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">応募メッセージ</h3>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent mb-4"
                  placeholder="応募理由や自己PRを入力してください"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() =>
                      onNavigate(profile?.role === 'organization' ? 'org-dashboard' : 'inspector-dashboard')
                    }
                    className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    戻る
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400"
                  >
                    {applying ? '応募中...' : 'この案件に応募する'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
