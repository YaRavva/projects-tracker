import React from 'react';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

const ResetPasswordPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Перенаправляем авторизованных пользователей на дашборд
  React.useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPasswordPage; 