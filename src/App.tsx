import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { Navigation } from './components/Navigation';
import { OrgDashboard } from './components/org/OrgDashboard';
import { InspectorDashboard } from './components/inspector/InspectorDashboard';
import { MessagesScreen } from './components/messages/MessagesScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { HistoryScreen } from './components/history/HistoryScreen';
import { NotificationsScreen } from './components/notifications/NotificationsScreen';
import { CreateJobScreen } from './components/org/CreateJobScreen';
import { JobDetailScreen } from './components/job/JobDetailScreen';
import { ApplicationsScreen } from './components/org/ApplicationsScreen';
import { UserManagementScreen } from './components/org/UserManagementScreen';
import { CalendarScreen } from './components/calendar/CalendarScreen';

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

function App() {
  const { user, profile, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('org-dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setCurrentScreen(
        profile.role === 'organization' ? 'org-dashboard' : 'inspector-dashboard'
      );
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginScreen />;
  }

  const handleNavigate = (screen: Screen, jobId?: string) => {
    setCurrentScreen(screen);
    if (jobId) setSelectedJobId(jobId);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'org-dashboard':
        return (
          <OrgDashboard
            onNavigate={handleNavigate}
            onSelectJob={(jobId) => handleNavigate('job-detail', jobId)}
          />
        );
      case 'org-create-job':
        return <CreateJobScreen onNavigate={handleNavigate} />;
      case 'org-applications':
        return <ApplicationsScreen onNavigate={handleNavigate} jobId={selectedJobId} />;
      case 'inspector-dashboard':
        return (
          <InspectorDashboard
            onNavigate={handleNavigate}
            onSelectJob={(jobId) => handleNavigate('job-detail', jobId)}
          />
        );
      case 'job-detail':
        return <JobDetailScreen jobId={selectedJobId} onNavigate={handleNavigate} />;
      case 'messages':
        return <MessagesScreen onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfileScreen onNavigate={handleNavigate} />;
      case 'history':
        return <HistoryScreen onNavigate={handleNavigate} onSelectJob={(jobId) => handleNavigate('job-detail', jobId)} />;
      case 'calendar':
        return (
          <CalendarScreen
            onNavigate={handleNavigate}
            onSelectJob={(jobId) => handleNavigate('job-detail', jobId)}
          />
        );
      case 'user-management':
        // @ts-expect-error - UserManagementScreen has its own type definition
        return <UserManagementScreen onNavigate={handleNavigate} />;
      default:
        return profile.role === 'organization' ? (
          <OrgDashboard onNavigate={handleNavigate} onSelectJob={(jobId) => handleNavigate('job-detail', jobId)} />
        ) : (
          <InspectorDashboard onNavigate={handleNavigate} onSelectJob={(jobId) => handleNavigate('job-detail', jobId)} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation currentScreen={currentScreen} onNavigate={handleNavigate} />
      {renderScreen()}
    </div>
  );
}

export default App;
