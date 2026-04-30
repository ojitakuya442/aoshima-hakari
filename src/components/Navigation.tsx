import { Building2, MessageSquare, Bell, User, LogOut, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { notificationsApi } from '../services/api';

type Screen =
  | 'org-dashboard'
  | 'org-create-job'
  | 'org-applications'
  | 'inspector-dashboard'
  | 'job-detail'
  | 'messages'
  | 'profile'
  | 'history'
  | 'notifications';

export function Navigation({
  currentScreen,
  onNavigate,
}: {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}) {
  const { profile, signOut, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
    }
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const count = await notificationsApi.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

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
              検定マッチング
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
              className="text-slate-600 hover:text-slate-900"
            >
              ダッシュボード
            </button>
            <button
              onClick={() => onNavigate('messages')}
              className="text-slate-600 hover:text-slate-900 flex items-center space-x-1"
            >
              <MessageSquare className="w-5 h-5" />
              <span>メッセージ</span>
            </button>
            <button
              onClick={() => onNavigate('history')}
              className="text-slate-600 hover:text-slate-900 flex items-center space-x-1"
            >
              <History className="w-5 h-5" />
              <span>履歴</span>
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="text-slate-600 hover:text-slate-900"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('notifications')}
              className="text-slate-600 hover:text-slate-900 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
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
