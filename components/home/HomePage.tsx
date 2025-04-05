import React from 'react';
import Layout from '../layout/Layout';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();

  return (
    <Layout title="Home | Digital Projects Tracker">
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-6">
          Digital <span className="text-cryptix-green">Projects</span> Tracker
        </h1>

        <p className="text-xl text-gray-300 text-center max-w-3xl mb-8">
          Создавайте проекты, отслеживайте их прогресс, управляйте этапами и участниками.
          Включает аналитику и возможность импорта данных из PRD.md файлов.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link
                    href="/projects"
                    className="btn-primary text-lg px-6 py-3"
                  >
                    Мои проекты
                  </Link>
                  <Link
                    href="/settings"
                    className="btn-secondary text-lg px-6 py-3"
                  >
                    Настройки
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="btn-primary text-lg px-6 py-3"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    className="btn-secondary text-lg px-6 py-3"
                  >
                    Зарегистрироваться
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
          <div className="glass-card">
            <div className="glass-card-body">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-crypto-green-500/20 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-crypto-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Project Management</h3>
              </div>
              <p className="text-gray-300">
                Создавайте, редактируйте и удаляйте проекты. Отслеживайте их статус и прогресс в реальном времени.
              </p>
            </div>
          </div>

          <div className="glass-card">
            <div className="glass-card-body">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-crypto-green-500/20 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-crypto-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Управление этапами</h3>
              </div>
              <p className="text-gray-300">
                Разбивайте проекты на этапы, устанавливайте дедлайны и отмечайте выполнение задач.
              </p>
            </div>
          </div>

          <div className="glass-card">
            <div className="glass-card-body">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-crypto-green-500/20 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-crypto-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Командная работа</h3>
              </div>
              <p className="text-gray-300">
                Приглашайте участников в проекты и назначайте им роли для эффективной совместной работы.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
          <div className="glass-card">
            <div className="glass-card-body">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-crypto-green-500/20 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-crypto-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Продвинутая аналитика</h3>
              </div>
              <p className="text-gray-300">
                Отслеживайте тренды рынка с данными в реальном времени, настраиваемыми графиками и прогнозами для принятия решений.
              </p>
            </div>
          </div>

          <div className="glass-card">
            <div className="glass-card-body">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-crypto-green-500/20 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-crypto-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Безопасная интеграция</h3>
              </div>
              <p className="text-gray-300">
                Храните, управляйте и передавайте данные с протоколами безопасности, многоуровневым шифрованием и интеграцией.
              </p>
            </div>
          </div>

          <div className="glass-card">
            <div className="glass-card-body">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-crypto-green-500/20 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-crypto-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Поддержка мультиактивов</h3>
              </div>
              <p className="text-gray-300">
                Управляйте широким спектром криптовалют с обновлениями, продвинутыми инструментами и универсальной панелью управления.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;