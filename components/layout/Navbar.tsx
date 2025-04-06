import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useProfileModal } from '../../contexts/ProfileModalContext';

const Navbar: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const { openProfileModal } = useProfileModal();
  const { pathname } = router;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Функция выхода
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    setUserMenuOpen(false);
  };

  // Функция открытия модального окна профиля
  const handleProfileClick = () => {
    openProfileModal();
    setUserMenuOpen(false);
  };

  // Функция переключения меню пользователя
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Обработчик для закрытия меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
                  {/* Убрана кнопка Настройки */}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4 ml-auto">
            {!loading && (
              <>
                {user ? (
                  <div className="hidden md:flex items-center relative" ref={userMenuRef}>
                    <div
                      className="flex items-center space-x-2 px-3 py-1.5 bg-glass-bg backdrop-blur-md border border-glass-border rounded-full cursor-pointer hover:border-cryptix-green/50 transition-colors relative"
                      onClick={toggleUserMenu}
                    >
                      <div className="w-2 h-2 rounded-full bg-cryptix-green"></div>
                      <span className="text-gray-300">{userName || 'Пользователь'}</span>
                      <svg
                        className={`w-4 h-4 text-cryptix-green ml-1 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Выпадающее меню пользователя */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 backdrop-blur-md border border-glass-border rounded-lg overflow-hidden z-50 animate-fadeIn" style={{ top: '100%', backgroundColor: 'rgba(4, 10, 15, 0.85)', boxShadow: '0 0 30px rgba(0, 255, 157, 0.25), 0 0 10px rgba(0, 255, 157, 0.15), 0 0 5px rgba(0, 255, 157, 0.1)' }}>
                        <div className="p-4 border-b border-glass-border flex items-center space-x-3" style={{ backgroundColor: 'rgba(4, 10, 15, 0.9)' }}>
                          <div className="w-12 h-12 rounded-full bg-cryptix-green/10 border border-cryptix-green/30 flex items-center justify-center">
                            <svg className="w-8 h-8 text-cryptix-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-white font-medium">{userName || 'Пользователь'}</div>
                            <div className="text-xs text-gray-400">{user?.email}</div>
                          </div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={handleProfileClick}
                            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-cryptix-green/20 hover:text-white rounded-md transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-5 h-5 text-cryptix-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Профиль</span>
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-colors flex items-center space-x-2 mt-1"
                          >
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Выйти</span>
                          </button>
                        </div>
                      </div>
                    )}
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
                <div className="px-3 py-3 border-b border-glass-border mb-2 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-cryptix-green/10 border border-cryptix-green/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cryptix-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">{userName || 'Пользователь'}</div>
                    <div className="text-xs text-gray-400">{user?.email}</div>
                  </div>
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
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleProfileClick();
                  }}
                  className="w-full text-left mobile-nav-link flex items-center space-x-2"
                >
                  <svg className="w-5 h-5 text-cryptix-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Профиль</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left mobile-nav-link text-red-400 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Выйти</span>
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

      {/* Модальное окно перенесено в Layout */}
    </nav>
  );
};

export default Navbar;