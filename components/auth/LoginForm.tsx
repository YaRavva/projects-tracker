import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import OAuthButtons from './OAuthButtons';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      // Редирект происходит в контексте аутентификации
    } catch (err: any) {
      setError(err.message || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Вход в систему</h2>

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-input"
          placeholder="your@email.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="form-input"
          placeholder="••••••••"
        />
      </div>

      <div className="text-right mb-4">
        <Link href="/reset-password" className="text-sm text-crypto-green-500 hover:text-crypto-green-400">
          Забыли пароль?
        </Link>
      </div>

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={loading}
      >
        {loading ? 'Вход...' : 'Войти'}
      </button>

      <OAuthButtons className="mt-4" />

      <div className="mt-4 text-center text-sm text-gray-400">
        Нет аккаунта?{' '}
        <Link href="/register" className="text-crypto-green-500 hover:text-crypto-green-400">
          Зарегистрироваться
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;