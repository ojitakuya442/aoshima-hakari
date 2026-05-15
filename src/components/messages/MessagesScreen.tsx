import { useState, useEffect, useRef } from 'react';
import { Send, Search, Paperclip, CheckCheck, Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { messagesApi, jobsApi, applicationsApi, inspectorsApi, organizationsApi, auditLogsApi } from '../../services/api';

type Screen = 'org-dashboard' | 'org-create-job' | 'org-applications' | 'inspector-dashboard' | 'job-detail' | 'messages' | 'profile' | 'history' | 'notifications';

export function MessagesScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [newRoomJobId, setNewRoomJobId] = useState('');
  const [newRoomInspectorId, setNewRoomInspectorId] = useState('');
  const [newRoomMessage, setNewRoomMessage] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [jobApplicants, setJobApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [user, profile]);

  // 案件が選択されたとき、その案件の応募者を取得（検定機関向け）
  useEffect(() => {
    if (!newRoomJobId || profile?.role !== 'organization') {
      setJobApplicants([]);
      setNewRoomInspectorId('');
      return;
    }
    const fetchApplicants = async () => {
      setLoadingApplicants(true);
      try {
        const apps = await applicationsApi.getByJob(newRoomJobId);
        setJobApplicants(apps || []);
        setNewRoomInspectorId('');
      } catch (e) {
        console.error('Failed to fetch applicants:', e);
        setJobApplicants([]);
      } finally {
        setLoadingApplicants(false);
      }
    };
    fetchApplicants();
  }, [newRoomJobId, profile?.role]);

  useEffect(() => {
    let subscription: any = null;

    if (selectedJobId) {
      console.log('Selected job changed to:', selectedJobId);
      setMessages([]);
      setError(null);
      setRenderError(null);
      loadMessages();

      try {
        subscription = messagesApi.subscribeToJob(selectedJobId, async (message) => {
          try {
            console.log('New message received via subscription:', message);
            const enrichedMessages = await messagesApi.getByJob(selectedJobId);
            const enrichedMessage = enrichedMessages?.find((m: any) => m.id === message.id);
            if (enrichedMessage) {
              setMessages((prev) => {
                const exists = prev.some((m) => m.id === enrichedMessage.id);
                if (exists) return prev;
                return [...prev, enrichedMessage];
              });
            }
          } catch (error) {
            console.error('Failed to fetch new message details:', error);
          }
        });
      } catch (error) {
        console.error('Failed to setup subscription:', error);
      }

      return () => {
        if (subscription) {
          console.log('Unsubscribing from messages');
          try {
            subscription.unsubscribe();
          } catch (error) {
            console.error('Error unsubscribing:', error);
          }
        }
      };
    } else {
      setMessages([]);
      setError(null);
      setRenderError(null);
    }
  }, [selectedJobId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadJobs = async () => {
    if (!user || !profile) {
      console.log('No user or profile, skipping loadJobs');
      setLoading(false);
      return;
    }

    console.log('Loading jobs for user:', user.id, 'role:', profile.role);

    try {
      if (profile.role === 'organization') {
        const org = await organizationsApi.getByUserId(user.id);
        console.log('Organization data:', org);

        if (org) {
          const jobsData = await jobsApi.getByOrganization(org.id);
          console.log('Jobs from API:', jobsData);

          const jobsWithOrg = jobsData?.map((job: any) => ({
            ...job,
            organizations: { organization_name: org.organization_name },
          })) || [];

          console.log('Organization jobs processed:', jobsWithOrg);
          setJobs(jobsWithOrg);

          if (jobsWithOrg && jobsWithOrg.length > 0) {
            console.log('Setting initial job ID:', jobsWithOrg[0].id);
            setSelectedJobId(jobsWithOrg[0].id);
          } else {
            console.log('No jobs found for organization');
          }
        } else {
          console.log('No organization found for user');
        }
      } else {
        const inspector = await inspectorsApi.getByUserId(user.id);
        console.log('Inspector data:', inspector);

        if (inspector) {
          const applications = await applicationsApi.getByInspector(inspector.id);
          console.log('Inspector applications raw:', applications);

          if (!applications || applications.length === 0) {
            console.log('No applications found for inspector');
            setJobs([]);
          } else {
            const jobsData = applications
              .map((app: any) => {
                console.log('Processing application:', app);
                if (!app.jobs) {
                  console.warn('Application has no jobs field:', app);
                  return null;
                }
                return app.jobs;
              })
              .filter(Boolean);

            console.log('Inspector jobs processed:', jobsData);
            setJobs(jobsData);

            if (jobsData.length > 0) {
              console.log('Setting initial job ID:', jobsData[0].id);
              setSelectedJobId(jobsData[0].id);
            } else {
              console.log('No valid jobs found in applications');
            }
          }
        } else {
          console.log('No inspector found for user');
        }
      }
    } catch (error) {
      console.error('Failed to load jobs - ERROR:', error);
      setError('案件の読み込みに失敗しました');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomJobId || !newRoomMessage.trim() || !user) return;
    setCreatingRoom(true);
    try {
      const targetJobId = newRoomJobId;
      await messagesApi.send({ job_id: targetJobId, sender_id: user.id, content: newRoomMessage.trim() });
      setShowNewRoomModal(false);
      setNewRoomJobId('');
      setNewRoomInspectorId('');
      setNewRoomMessage('');
      setJobApplicants([]);
      // Reload jobs and select the new one
      await loadJobs();
      setSelectedJobId(targetJobId);
    } catch (e) {
      console.error('Failed to create talk room:', e);
      alert('トークルームの作成に失敗しました');
    } finally {
      setCreatingRoom(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedJobId) return;

    setMessagesLoading(true);
    setError(null);

    try {
      console.log('Loading messages for job:', selectedJobId);
      const messagesData = await messagesApi.getByJob(selectedJobId);
      console.log('Loaded messages:', messagesData);

      if (!messagesData) {
        console.warn('No messages data returned');
        setMessages([]);
      } else {
        setMessages(messagesData);
      }

      if (user) {
        await messagesApi.markJobAsRead(selectedJobId, user.id);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('メッセージの読み込みに失敗しました');
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedJobId || !user) return;

    try {
      const sentMessage = await messagesApi.send({
        job_id: selectedJobId,
        sender_id: user.id,
        content: newMessage.trim(),
      });

      if (user.role === 'inspector') {
        try {
          await auditLogsApi.create({
            action: 'send_message',
            action_type: 'message',
            entity_type: 'message',
            entity_id: sentMessage?.id,
            details: {
              job_id: selectedJobId,
              content_length: newMessage.trim().length,
            },
          });
        } catch (logError) {
          console.error('Failed to log message action:', logError);
        }
      }

      setNewMessage('');

      if (sentMessage) {
        const messagesData = await messagesApi.getByJob(selectedJobId);
        const enrichedMessage = messagesData?.find((m: any) => m.id === sentMessage.id);
        if (enrichedMessage) {
          setMessages((prev) => [...prev, enrichedMessage]);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('メッセージの送信に失敗しました');
    }
  };

  const selectedJob = selectedJobId ? jobs.find((j) => j.id === selectedJobId) : null;

  console.log('=== DEBUG INFO ===');
  console.log('Selected job ID:', selectedJobId);
  console.log('Jobs is array:', Array.isArray(jobs));
  console.log('All jobs count:', jobs?.length || 0);
  console.log('Jobs IDs:', jobs?.map(j => ({ id: j?.id, title: j?.title })) || []);
  console.log('Selected job found:', selectedJob ? 'Yes' : 'No');
  console.log('Selected job:', selectedJob);
  console.log('==================');

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
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">メッセージ</h1>
        </div>

      {error && !loading && jobs.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadJobs}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            再試行
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-12rem)] min-h-[500px]">
        <div className="grid grid-cols-3 h-full">
          <div className="col-span-1 border-r border-slate-200 overflow-y-auto">
            <div className="p-4 border-b border-slate-200">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="検索..."
                  className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowNewRoomModal(true)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>新規トークルーム</span>
              </button>
            </div>
            {jobs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                {loading ? '読み込み中...' : '案件がありません'}
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {jobs.map((job) => {
                  if (!job || !job.id) return null;
                  const partnerName = profile?.role === 'organization'
                    ? '検定官'
                    : (job.organizations?.organization_name || '検定機関');
                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedJobId === job.id ? 'bg-slate-100 border-l-2 border-slate-700' : ''
                      }`}
                    >
                      {/* 検定官名（太字） */}
                      <p className="font-bold text-slate-900 text-sm truncate">{partnerName}</p>
                      {/* 検定名 */}
                      <p className="text-sm text-slate-700 truncate mt-0.5">{job.title || '無題'}</p>
                      <div className="flex items-center justify-between mt-1 gap-2">
                        {/* 日付 */}
                        <span className="text-xs text-slate-500 shrink-0">
                          {job.inspection_date || '—'}
                        </span>
                        {/* エリア */}
                        <span className="text-xs text-slate-500 truncate">
                          {[job.prefecture, job.city].filter(Boolean).join(' ') || '—'}
                        </span>
                        {/* 未読バッジ */}
                        {selectedJobId !== job.id && job.id.charCodeAt(0) % 2 === 0 && (
                          <span className="flex-shrink-0 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">1</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="col-span-2 flex flex-col">
            {selectedJobId && !selectedJob ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-slate-600 mb-4">案件が見つかりません</p>
                  <button
                    onClick={() => {
                      console.log('Reset selection');
                      setSelectedJobId(null);
                      loadJobs();
                    }}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    リセット
                  </button>
                </div>
              </div>
            ) : selectedJob ? (
              <>
                <div className="p-4 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-900">
                    {selectedJob.title || '無題'}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {selectedJob.organizations?.organization_name || '組織名なし'}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <p className="text-red-600">{error}</p>
                      <button
                        onClick={loadMessages}
                        className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        再試行
                      </button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      メッセージがまだありません
                    </div>
                  ) : (
                    messages.map((message) => {
                      try {
                        if (!message || !message.id) {
                          console.error('Invalid message:', message);
                          return null;
                        }

                        const isOwnMessage = message.sender_id === user?.id;
                        const senderName = message.sender?.full_name || message.sender_id || '不明';

                        console.log('Rendering message:', {
                          id: message.id,
                          sender_id: message.sender_id,
                          sender: message.sender,
                          content: message.content?.substring(0, 20),
                          created_at: message.created_at
                        });

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                              {!isOwnMessage && (
                                <p className="text-xs text-slate-600 mb-1 px-2">{senderName}</p>
                              )}
                              <div
                                className={`max-w-md rounded-lg p-3 ${
                                  isOwnMessage
                                    ? 'bg-slate-700 text-white'
                                    : 'bg-slate-100 text-slate-900'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{message.content || ''}</p>
                                {message.created_at && (
                                  <div className={`flex items-center mt-1 space-x-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                    <p
                                      className={`text-xs ${
                                        isOwnMessage ? 'text-slate-300' : 'text-slate-500'
                                      }`}
                                    >
                                      {new Date(message.created_at).toLocaleString('ja-JP', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                    {isOwnMessage && (
                                      <span className="flex items-center text-xs text-blue-300 ml-2" title="既読">
                                        <CheckCheck className="w-3 h-3 mr-0.5" />
                                        既読
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      } catch (renderErr) {
                        console.error('Error rendering message:', message, renderErr);
                        return (
                          <div key={message?.id || Math.random()} className="text-center py-2 text-red-500 text-sm">
                            メッセージの表示エラー
                          </div>
                        );
                      }
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50">
                  <div className="flex items-center space-x-2">
                    <label className="cursor-pointer p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
                      <Paperclip className="w-5 h-5" />
                      <input type="file" className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="メッセージを入力..."
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400 flex items-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>送信</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                メッセージを選択してください
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* パターン2: 新規トークルーム作成モーダル */}
    {showNewRoomModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">新規トークルーム作成</h2>
            <button
              onClick={() => setShowNewRoomModal(false)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* 検定機関向け: 楽を選ぶ */}
            {profile?.role === 'organization' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">検定案件を選択</label>
                  <select
                    value={newRoomJobId}
                    onChange={(e) => setNewRoomJobId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">— 案件を選んでください —</option>
                    {jobs.map((j: any) => (
                      <option key={j.id} value={j.id}>{j.title || '無題'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    問合せ先の検定官
                  </label>
                  {!newRoomJobId ? (
                    <p className="text-sm text-slate-400 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50">
                      まず案件を選択してください
                    </p>
                  ) : loadingApplicants ? (
                    <div className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-500">
                      読み込み中...
                    </div>
                  ) : jobApplicants.length === 0 ? (
                    <p className="text-sm text-amber-600 px-3 py-2 border border-amber-200 rounded-lg bg-amber-50">
                      この案件への応募者がいません
                    </p>
                  ) : (
                    <select
                      value={newRoomInspectorId}
                      onChange={(e) => setNewRoomInspectorId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="">— 検定官を選んでください —</option>
                      {jobApplicants.map((app: any) => (
                        <option key={app.id} value={app.inspector_id}>
                          {app.inspectors?.profiles?.full_name || '名前不明'}
                          {app.status === 'confirmed' ? ' ✓ 確定済' : app.status === 'pending' ? ' （審査中）' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </>
            )}

            {/* 検定官向け: 楽を選ぶ */}
            {profile?.role === 'inspector' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">問合せ先の検定案件</label>
                <select
                  value={newRoomJobId}
                  onChange={(e) => setNewRoomJobId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  <option value="">— 案件を選んでください —</option>
                  {jobs.map((j: any) => (
                    <option key={j.id} value={j.id}>{j.title || '無題'}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">応募済みの案件を対象に問合せが送信できます</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">最初のメッセージ</label>
              <textarea
                value={newRoomMessage}
                onChange={(e) => setNewRoomMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                placeholder="問合せ内容を入力してください"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              onClick={() => setShowNewRoomModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleCreateRoom}
              disabled={!newRoomJobId || !newRoomMessage.trim() || creatingRoom}
              className="px-5 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{creatingRoom ? '作成中...' : 'トークルームを作成'}</span>
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
