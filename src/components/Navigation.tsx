import { Building2, MessageSquare, User, LogOut, History, Users, CalendarDays, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { messagesApi } from '../services/api';

type Screen =
  | 'org-dashboard'
  | 'org-create-job'
  | 'org-applications'
  | 'inspector-dashboard'
  | 'job-detail'
  | 'messages'
  | 'profile'
  | 'history'
  | 'user-management'
  | 'calendar';

export function Navigation({
  currentScreen,
  onNavigate,
}: {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}) {
  const { profile, signOut, user } = useAuth();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const count = await messagesApi.getUnreadCount(user.id);
        setUnreadMessageCount(count);
      } catch (error) {
        console.error('Failed to load unread message count:', error);
      }
    };
    load();
    const intervalId = window.setInterval(load, 5000);
    return () => window.clearInterval(intervalId);
  }, [user, currentScreen]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Building2 className="w-8 h-8 text-slate-700" />
            <span className="text-xl font-bold text-slate-900">
              検定員募集：情報サイト
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() =>
                onNavigate(
                  profile?.role === 'organization'
                    ? 'org-dashboard'
                    : 'inspector-dashboard'
                )
              }
              className={`hover:text-slate-900 flex items-center space-x-1 ${
                currentScreen === 'org-dashboard' || currentScreen === 'inspector-dashboard'
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-600'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>ダッシュボード</span>
            </button>
            {profile?.role === 'organization' && (
              <button
                onClick={() => onNavigate('calendar')}
                className={`hover:text-slate-900 flex items-center space-x-1 ${
                  currentScreen === 'calendar' ? 'text-slate-900 font-semibold' : 'text-slate-600'
                }`}
              >
                <CalendarDays className="w-5 h-5" />
                <span>カレンダー</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('history')}
              className={`hover:text-slate-900 flex items-center space-x-1 ${
                currentScreen === 'history' ? 'text-slate-900 font-semibold' : 'text-slate-600'
              }`}
            >
              <History className="w-5 h-5" />
              <span>履歴</span>
            </button>
            <button
              onClick={() => onNavigate('messages')}
              className={`hover:text-slate-900 flex items-center space-x-1 relative ${
                currentScreen === 'messages' ? 'text-slate-900 font-semibold' : 'text-slate-600'
              }`}
            >
              <span className="relative inline-flex">
                <MessageSquare className="w-5 h-5" />
                {unreadMessageCount > 0 && (
                  <span
                    aria-label={`未読メッセージ${unreadMessageCount}件`}
                    className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-500 text-white text-[0.65rem] font-semibold leading-none"
                  >
                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                  </span>
                )}
              </span>
              <span>メッセージ</span>
            </button>
            {profile?.role === 'organization' && (
              <button
                onClick={() => onNavigate('user-management')}
                className="text-slate-600 hover:text-slate-900 flex items-center space-x-1"
                title="ユーザー管理"
              >
                <Users className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => onNavigate('profile')}
              className="text-slate-600 hover:text-slate-900"
              title="プロフィール"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={handleSignOut}
              className="text-slate-600 hover:text-slate-900"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
