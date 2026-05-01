import { useState, useEffect } from 'react';
import { User, AlertCircle, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { organizationsApi, inspectorsApi } from '../../services/api';
import { supabase } from '../../lib/supabase';

type Screen = 'org-dashboard' | 'org-create-job' | 'org-applications' | 'inspector-dashboard' | 'job-detail' | 'messages' | 'profile' | 'history' | 'user-management';

export function ProfileScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    experience: '',
    skills: '',
    organization_name: '',
    description: '',
  });

  useEffect(() => {
    loadProfile();
  }, [user, profile]);

  const loadProfile = async () => {
    if (!user || !profile) return;

    setAvatarUrl(profile.avatar_url || null);

    setFormData({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      address: profile.address || '',
      experience: '',
      skills: '',
      organization_name: '',
      description: '',
    });

    try {
      if (profile.role === 'inspector') {
        const inspector = await inspectorsApi.getByUserId(user.id);
        if (inspector) {
          setFormData((prev) => ({
            ...prev,
            experience: inspector.experience || '',
            skills: inspector.skills || '',
          }));
        }
      } else {
        const org = await organizationsApi.getByUserId(user.id);
        if (org) {
          setFormData((prev) => ({
            ...prev,
            organization_name: org.organization_name || '',
            description: org.description || '',
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;

    const file = e.target.files[0];
    setUploadingAvatar(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アバター画像のアップロードに失敗しました');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
      });

      if (profile?.role === 'inspector' && user) {
        const inspector = await inspectorsApi.getByUserId(user.id);
        if (inspector) {
          await inspectorsApi.update(inspector.id, {
            experience: formData.experience,
            skills: formData.skills,
          });
        }
      } else if (profile?.role === 'organization' && user) {
        const org = await organizationsApi.getByUserId(user.id);
        if (org) {
          await organizationsApi.update(org.id, {
            organization_name: formData.organization_name,
            description: formData.description,
          });
        }
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">マイページ</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">プロフィールを更新しました</p>
          </div>
        )}

        <h2 className="text-xl font-bold text-slate-900 mb-6">プロフィール情報</h2>

        <div className="flex items-start space-x-6 mb-8">
          <div className="flex-shrink-0 relative group">
            <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-slate-400" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                className="hidden"
              />
            </label>
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {profile?.role === 'organization' ? '組織名' : '氏名'}
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">電話番号</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">住所</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {profile?.role === 'inspector' && (
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">経験</label>
              <textarea
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="検定業務の経験年数など..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">スキル</label>
              <textarea
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="得意分野、特技など..."
              ></textarea>
            </div>
          </div>
        )}

        {profile?.role === 'organization' && (
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">組織概要</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="組織の説明を入力してください"
              ></textarea>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={() =>
              onNavigate(profile?.role === 'organization' ? 'org-dashboard' : 'inspector-dashboard')
            }
            className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
