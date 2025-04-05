import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { updatePassword } from '../../lib/supabase';

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

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
      <div className="auth-form">
        <h2>Пароль успешно изменен!</h2>
        <p>Вы будете перенаправлены на страницу проектов...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Сброс пароля</h2>
      
      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="password">Новый пароль</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="form-input"
          placeholder="Минимум 6 символов"
          minLength={6}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword">Подтвердите пароль</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="form-input"
          placeholder="Повторите пароль"
          minLength={6}
        />
      </div>
      
      <button
        type="submit"
        className="btn-primary w-full"
        disabled={loading}
      >
        {loading ? 'Сохранение...' : 'Сохранить новый пароль'}
      </button>
    </form>
  );
};

export default ResetPasswordForm; 