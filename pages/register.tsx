import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Если пользователь уже авторизован, перенаправляем на страницу проектов
      router.push('/projects');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Layout title="Регистрация | Управление проектами">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-green-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Регистрация | Управление проектами">
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage; 