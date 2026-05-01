import { useState, useEffect, useRef } from 'react';
import { Send, Search, Paperclip, CheckCheck } from 'lucide-react';
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

  useEffect(() => {
    loadJobs();
  }, [user, profile]);

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

      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
        <div className="grid grid-cols-3 h-full">
          <div className="col-span-1 border-r border-slate-200 overflow-y-auto">
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="検索..."
                  className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>
            </div>
            {jobs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                {loading ? '読み込み中...' : '案件がありません'}
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {jobs.map((job) => {
                  if (!job || !job.id) {
                    console.error('Invalid job in list:', job);
                    return null;
                  }
                  return (
                    <div
                      key={job.id}
                      onClick={() => {
                        console.log('Job clicked:', job.id, job.title);
                        setSelectedJobId(job.id);
                      }}
                      className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedJobId === job.id ? 'bg-slate-50' : ''
                      }`}
                    >
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {job.title || '無題'}
                          </h3>
                          {/* 未読バッジ（モック表示） */}
                          {selectedJobId !== job.id && job.id.charCodeAt(0) % 2 === 0 && (
                            <span className="flex-shrink-0 ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                              1
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 truncate mt-1">
                          {job.organizations?.organization_name || '組織名なし'}
                        </p>
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
  );
}
