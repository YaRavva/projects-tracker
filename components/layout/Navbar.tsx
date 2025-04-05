import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

const Navbar: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const { pathname } = router;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Получаем имя пользователя из профиля
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (data && data.full_name) {
          setUserName(data.full_name);
        } else if (user.email) {
          // Используем email как запасной вариант, если имя не найдено
          setUserName(user.email);
        } else {
          // Если даже email отсутствует, устанавливаем пустую строку
          setUserName('');
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  return (
    <nav className="bg-glass-bg backdrop-blur-md border-b border-glass-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-white flex items-center">
                <span className="text-cryptix-green mr-1">Digital</span>Projects<span className="text-cryptix-green ml-1">Tracker</span>
                <div className="w-1.5 h-1.5 rounded-full bg-cryptix-green ml-1 animate-pulse"></div>
              </span>
            </Link>

            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {user && !loading && (
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    href="/projects"
                    className={`nav-link ${pathname === '/projects' ? 'active' : ''}`}
                  >
                    Проекты
                  </Link>
                  <Link href="/analytics" className={`nav-link ${router.pathname === '/analytics' ? 'active' : ''}`}>
                    Аналитика
                  </Link>
                  <Link href="/settings" className={`nav-link ${router.pathname === '/settings' ? 'active' : ''}`}>
                    Настройки
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="hidden md:flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-glass-bg backdrop-blur-md border border-glass-border rounded-full">
                      <div className="w-2 h-2 rounded-full bg-cryptix-green"></div>
                      <span className="text-gray-300">{userName || 'Пользователь'}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="btn-secondary-sm hover:text-red-400"
                    >
                      Выйти
                    </button>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center space-x-4">
                    <Link href="/login" className="glass-button-sm">
                      Войти
                    </Link>
                    <Link href="/register" className="btn-primary-sm">
                      Регистрация
                    </Link>
                  </div>
                )}
                <button
                  className="md:hidden text-gray-300 hover:text-white"
                  onClick={toggleMobileMenu}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-glass-bg backdrop-blur-md border-b border-glass-border">
            {user ? (
              <>
                <div className="px-3 py-2 text-gray-300 font-medium border-b border-glass-border mb-2">
                  {userName || 'Пользователь'}
                </div>
                <Link
                  href="/projects"
                  className={`mobile-nav-link ${pathname === '/projects' ? 'active' : ''}`}
                >
                  Проекты
                </Link>
                <Link href="/analytics" className="mobile-nav-link">
                  Аналитика
                </Link>
                <Link href="/settings" className="mobile-nav-link">
                  Настройки
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left mobile-nav-link text-red-400"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="mobile-nav-link">
                  Войти
                </Link>
                <Link href="/register" className="mobile-nav-link">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;