import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, mockData, MockUser, Profile } from '../lib/supabase';

type AuthContextType = {
  user: MockUser | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, role: 'organization' | 'inspector', fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setProfile(mockData.profiles.find((item) => item.id === currentUser.id) || null);
      setLoading(false);
    }, 250);

    return () => window.clearTimeout(timer);
  }, []);

  const signIn = async (email: string) => {
    const nextProfile = mockData.profiles.find((item) => item.email === email) || mockData.profiles[0];
    mockData.currentUserId = nextProfile.id;
    setUser(getCurrentUser());
    setProfile(nextProfile);
  };

  const signUp = async (email: string, _password: string, role: 'organization' | 'inspector', fullName: string) => {
    const existing = mockData.profiles.find((item) => item.email === email);
    const nextProfile =
      existing ||
      ({
        id: `${role}-${Date.now()}`,
        email,
        full_name: fullName,
        phone: null,
        address: null,
        role,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } satisfies Profile);

    if (!existing) {
      mockData.profiles.push(nextProfile);
    }

    mockData.currentUserId = nextProfile.id;
    setUser(getCurrentUser());
    setProfile(nextProfile);
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async () => undefined;

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('Not authenticated');
    const target = mockData.profiles.find((item) => item.id === user.id);
    if (target) {
      Object.assign(target, updates, { updated_at: new Date().toISOString() });
      setProfile({ ...target });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
