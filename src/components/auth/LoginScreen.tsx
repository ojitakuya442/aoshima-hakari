import { useState } from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const { signIn, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userRole: 'organization' | 'inspector') => {
    setError('');
    setLoading(true);

    try {
      const testAccounts = {
        organization: { email: 'org@test.com', password: 'test123456' },
        inspector: { email: 'inspector@test.com', password: 'test123456' },
      };

      const account = testAccounts[userRole];
      await signIn(account.email, account.password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Building2 className="w-16 h-16 mx-auto text-slate-700 mb-4" />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              パスワード再設定
            </h1>
            <p className="text-slate-600">
              登録されたメールアドレスを入力してください
            </p>
          </div>

          {resetSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">
                パスワード再設定用のリンクをメールで送信しました。
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400"
              >
                {loading ? '送信中...' : '再設定リンクを送信'}
              </button>
            </form>
          )}

          <button
            onClick={() => {
              setShowResetPassword(false);
              setResetSuccess(false);
              setError('');
            }}
            className="w-full mt-4 text-center text-sm text-slate-600 hover:text-slate-900"
          >
            ログイン画面に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Building2 className="w-16 h-16 mx-auto text-slate-700 mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            検定マッチング
          </h1>
          <p className="text-slate-600">ログイン</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div className="flex items-center justify-end text-sm">
            <button
              type="button"
              onClick={() => setShowResetPassword(true)}
              className="text-slate-600 hover:text-slate-900"
            >
              パスワードを忘れた方
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400"
          >
            {loading ? '処理中...' : 'ログイン'}
          </button>

          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">または</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('organization')}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 text-sm font-medium"
              >
                検定機関でログイン
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('inspector')}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 text-sm font-medium"
              >
                検定官でログイン
              </button>
            </div>
            <p className="text-xs text-center text-slate-500">
              テストアカウントでログイン
            </p>
          </div>

          <p className="text-xs text-center text-slate-500 pt-2">
            アカウントは管理者からの招待制です
          </p>

          <div className="pt-4 border-t border-slate-200 text-center">
            <button
              type="button"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              利用規約
            </button>
            <span className="text-slate-400 mx-2">|</span>
            <button
              type="button"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              プライバシーポリシー
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
