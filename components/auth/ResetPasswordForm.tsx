import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { updatePassword, supabase } from '../../lib/supabase';

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  // Получаем email пользователя при загрузке компонента
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      if (data?.session?.user?.email) {
        setUserEmail(data.session.user.email);
      }
    };

    getSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      const { error } = await updatePassword(password);
      if (error) throw error;
      setSuccess(true);

      // Редирект на страницу проектов после успешного сброса пароля
      setTimeout(() => {
        router.push('/projects');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Ошибка при сбросе пароля');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Пароль успешно изменен!</h2>

        {userEmail && (
          <div className="mb-4 text-center">
            <p className="text-gray-300 text-sm">Для аккаунта:</p>
            <p className="text-cryptix-green font-medium">{userEmail}</p>
          </div>
        )}

        <p className="text-gray-300 text-center mb-4">Вы будете перенаправлены на страницу проектов...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crypto-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">Сброс пароля</h2>

      {userEmail && (
        <div className="mb-6 text-center">
          <p className="text-gray-300 text-sm">Для аккаунта:</p>
          <p className="text-cryptix-green font-medium">{userEmail}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Новый пароль</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 bg-cryptix-dark border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30"
          placeholder="Минимум 6 символов"
          minLength={6}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Подтвердите пароль</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-3 py-2 bg-cryptix-dark border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30"
          placeholder="Повторите пароль"
          minLength={6}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-cryptix-green to-cryptix-green-dark text-black font-medium py-2 px-4 rounded-md hover:from-cryptix-green-dark hover:to-cryptix-green transition-all duration-300 mt-6"
        disabled={loading}
      >
        {loading ? 'Сохранение...' : 'Сохранить новый пароль'}
      </button>
    </form>
  );
};

export default ResetPasswordForm;