import { useState, useEffect } from 'react';
import { Check, X, User, RefreshCcw, AlertCircle, MessageSquare, Send, Info } from 'lucide-react';
import { applicationsApi, jobsApi, notificationsApi, messagesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

type Screen = 'org-dashboard' | 'org-create-job' | 'org-applications' | 'job-detail' | 'messages' | 'profile' | 'history' | 'notifications';

export function ApplicationsScreen({
  jobId,
  onNavigate,
}: {
  jobId: string | null;
  onNavigate: (screen: Screen) => void;
}) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejected, setShowRejected] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [detailApp, setDetailApp] = useState<any>(null);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadApplications();
    }
  }, [jobId]);

  const loadApplications = async () => {
    if (!jobId) return;

    try {
      const [jobData, applicationsData] = await Promise.all([
        jobsApi.getById(jobId),
        applicationsApi.getByJob(jobId)
      ]);
      setJob(jobData);
      setApplications(applicationsData || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (applicationId: string) => {
    try {
      await applicationsApi.confirm(applicationId);
      loadApplications();
    } catch (error) {
      console.error('Failed to confirm application:', error);
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      const app = await applicationsApi.reject(applicationId);

      if (app?.inspector_id) {
        const application = applications.find(a => a.id === applicationId);
        try {
          await notificationsApi.create({
            user_id: application?.inspectors?.user_id,
            type: 'application_rejected',
            title: '応募が辞退されました',
            message: `${job?.title}の応募が辞退されました`,
            related_id: jobId,
          });
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
        }
      }

      loadApplications();
    } catch (error) {
      console.error('Failed to reject application:', error);
    }
  };

  const handleReopenJob = async () => {
    if (!jobId || !job) return;

    if (!confirm('この案件を再募集しますか？')) return;

    try {
      await jobsApi.updateStatus(jobId, 'open');
      loadApplications();
      alert('案件を再募集しました');
    } catch (error) {
      console.error('Failed to reopen job:', error);
      alert('案件の再募集に失敗しました');
    }
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

  const pendingApplications = applications.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const rejectedApplications = applications.filter(a => a.status === 'rejected' || a.status === 'withdrawn');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => onNavigate('org-dashboard')}
          className="text-slate-600 hover:text-slate-900 mb-4"
        >
          ← 戻る
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">応募一覧</h1>
          <div className="flex items-center space-x-4">
            {rejectedApplications.length > 0 && job?.status === 'closed' && (
              <button
                onClick={handleReopenJob}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>案件を再募集</span>
              </button>
            )}
            {rejectedApplications.length > 0 && (
              <button
                onClick={() => setShowRejected(!showRejected)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {showRejected ? '辞退履歴を非表示' : `辞退履歴を表示 (${rejectedApplications.length}件)`}
              </button>
            )}
          </div>
        </div>
      </div>

      {rejectedApplications.length > 0 && pendingApplications.length === 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-semibold">応募者がいません</p>
            <p className="text-sm text-amber-700 mt-1">
              すべての応募が辞退されました。案件を再募集することができます。
            </p>
          </div>
        </div>
      )}

      {showRejected && rejectedApplications.length > 0 && (
        <div className="bg-red-50 rounded-lg shadow mb-6">
          <div className="p-4 border-b border-red-200">
            <h2 className="font-semibold text-red-900">辞退履歴</h2>
          </div>
          <div className="divide-y divide-red-200">
            {rejectedApplications.map((app: any) => (
              <div key={app.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {app.inspectors?.profiles?.full_name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {app.inspectors?.profiles?.email}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        応募日: {new Date(app.created_at).toLocaleDateString()} |{' '}
                        {app.status === 'withdrawn' ? '取り下げ日' : '辞退日'}:{' '}
                        {new Date(app.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm ${
                    app.status === 'withdrawn'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {app.status === 'withdrawn' ? '取り下げ' : '辞退済'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {pendingApplications.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {rejectedApplications.length > 0 ? '現在の応募はありません' : '応募がまだありません'}
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {pendingApplications.map((app: any) => (
              <div key={app.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {app.inspectors?.profiles?.full_name || '—'}
                    </p>
                    <p className="text-xs text-slate-500">
                      応募日: {new Date(app.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setDetailApp(app);
                      setInquiryMessage('');
                      setInquirySent(false);
                    }}
                    className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-1 text-sm"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>詳細</span>
                  </button>
                  {app.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleConfirm(app.id)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>確定</span>
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 text-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>辞退</span>
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-700">確定済</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* パターン3: 応募者詳細ポップアップ */}
      {detailApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">応募者詳細</h2>
              <button onClick={() => setDetailApp(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-slate-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{detailApp.inspectors?.profiles?.full_name || '—'}</p>
                  <p className="text-sm text-slate-500">{detailApp.inspectors?.profiles?.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">応募日: {new Date(detailApp.created_at).toLocaleDateString('ja-JP')}</p>
                </div>
              </div>
              {detailApp.message && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">応募メッセージ</p>
                  <p className="text-sm text-slate-800">{detailApp.message}</p>
                </div>
              )}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>この応募者に問合せる</span>
                </h3>
                {inquirySent ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm font-semibold">問合せを送信しました</p>
                    <button
                      onClick={() => { setDetailApp(null); onNavigate('messages'); }}
                      className="mt-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      メッセージ画面へ
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm"
                      placeholder="問合せ内容を入力してください"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={async () => {
                          if (!inquiryMessage.trim() || !user || !jobId) return;
                          setSendingInquiry(true);
                          try {
                            await messagesApi.send({ job_id: jobId, sender_id: user.id, content: inquiryMessage.trim() });
                            setInquirySent(true);
                          } catch (e) {
                            console.error(e);
                            alert('送信に失敗しました');
                          } finally {
                            setSendingInquiry(false);
                          }
                        }}
                        disabled={sendingInquiry || !inquiryMessage.trim()}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400 flex items-center space-x-2 text-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{sendingInquiry ? '送信中...' : '問合せを送信'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
