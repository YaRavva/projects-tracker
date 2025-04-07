import React, { useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import HomePage from '../components/home/HomePage';

const Index = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Если пользователь авторизован, перенаправляем на страницу проектов
      // Используем относительный путь, чтобы учесть текущий хост и порт
      router.push('/projects');
    }
  }, [user, loading, router]);

  // Если пользователь не авторизован, показываем главную страницу
  return <HomePage />;
};

export default Index;