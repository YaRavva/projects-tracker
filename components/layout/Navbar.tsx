import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

const Navbar: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/login');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-crypto-dark/80 backdrop-blur-md border-b border-glass-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-crypto-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Управление проектами
            </Link>
            {user && !loading && (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/projects" className={`nav-link ${router.pathname === '/projects' || router.pathname.startsWith('/projects/') ? 'active' : ''}`}>
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
          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="hidden md:flex items-center space-x-4">
                    <span className="text-gray-300">{user.email}</span>
                    <button
                      onClick={handleSignOut}
                      className="btn-danger-sm"
                    >
                      Выйти
                    </button>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center space-x-4">
                    <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
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
      <div className={`mobile-menu ${mobileMenuOpen ? '' : 'hidden'}`}>
        <div className="container mx-auto px-4 py-4">
          {user && !loading ? (
            <>
              <Link href="/projects" className="mobile-menu-link">
                Проекты
              </Link>
              <Link href="/analytics" className="mobile-menu-link">
                Аналитика
              </Link>
              <Link href="/settings" className="mobile-menu-link">
                Настройки
              </Link>
              <div className="py-4 px-6 border-t border-glass-border mt-4">
                <div className="text-sm text-gray-300 mb-2">
                  {user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="btn-danger w-full text-sm"
                >
                  Выйти
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="mobile-menu-link">
                Войти
              </Link>
              <Link href="/register" className="mobile-menu-link">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 