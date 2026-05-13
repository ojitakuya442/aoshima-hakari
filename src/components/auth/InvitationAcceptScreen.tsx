import { useState } from 'react';
import { Building2, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';

type PasswordCheck = {
  label: string;
  ok: boolean;
};

const evaluatePassword = (pwd: string): PasswordCheck[] => [
  { label: '8文字以上', ok: pwd.length >= 8 },
  { label: '英字を含む', ok: /[A-Za-z]/.test(pwd) },
  { label: '数字を含む', ok: /[0-9]/.test(pwd) },
];

export function InvitationAcceptScreen({
  invitedEmail,
  onComplete,
  onBackToLogin,
}: {
  invitedEmail: string;
  onComplete: () => void;
  onBackToLogin: () => void;
}) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const checks = evaluatePassword(password);
  const passwordOk = checks.every((c) => c.ok);
  const confirmOk = password.length > 0 && password === confirmPassword;
  const formValid = name.trim() !== '' && passwordOk && confirmOk && agreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formValid) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 600);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">アカウント登録完了</h1>
          <p className="text-slate-600 mb-6">
            アカウントが有効化されました。ログイン画面からサインインしてください。
          </p>
          <button
            onClick={onComplete}
            className="w-full px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ログイン画面へ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <Building2 className="w-14 h-14 mx-auto text-slate-700 mb-3" />
          <h1 className="text-2xl font-bold text-slate-900 mb-1">招待を受諾</h1>
          <p className="text-sm text-slate-600">アカウント情報を設定してください</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 text-sm">
          <p className="text-blue-800">
            <span className="font-medium">{invitedEmail}</span> 宛の招待を受諾します
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              氏名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="例: 山田 太郎"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              パスワード <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label="パスワードを表示"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <ul className="mt-2 space-y-1">
              {checks.map((c) => (
                <li key={c.label} className={`text-xs flex items-center space-x-1 ${c.ok ? 'text-green-600' : 'text-slate-400'}`}>
                  <Check className="w-3 h-3" />
                  <span>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              パスワード（確認） <span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                confirmPassword && !confirmOk ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="••••••••"
              required
            />
            {confirmPassword && !confirmOk && (
              <p className="text-xs text-red-600 mt-1">パスワードが一致しません</p>
            )}
          </div>

          <label className="flex items-start space-x-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              利用規約とプライバシーポリシーに同意する
            </span>
          </label>

          <button
            type="submit"
            disabled={!formValid || submitting}
            className="w-full px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400"
          >
            {submitting ? '登録中...' : 'アカウントを有効化'}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full text-center text-sm text-slate-600 hover:text-slate-900"
          >
            ログイン画面に戻る
          </button>
        </form>
      </div>
    </div>
  );
}
