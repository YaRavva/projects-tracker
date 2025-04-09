import React from 'react';
import Navbar from './Navbar';
import Head from 'next/head';
import ProfileModal from '../profile/ProfileModal';
import { useProfileModal } from '../../contexts/ProfileModalContext';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Digital Projects Tracker' }) => {
  const { isProfileModalOpen, closeProfileModal } = useProfileModal();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Digital Projects Tracker - Manage your digital projects efficiently" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col min-h-screen h-screen relative overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {/* Фоновый градиент */}
        <div className="fixed inset-0 z-[-1]">
          <div className="absolute inset-0 bg-gradient-to-b from-cryptix-dark to-cryptix-darker"></div>
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(0,255,157,0.1)_0%,transparent_70%)]">
          </div>
        </div>

        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
          {children}
        </main>

        {/* Модальное окно профиля пользователя */}
        <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />
      </div>
    </>
  );
};

export default Layout;