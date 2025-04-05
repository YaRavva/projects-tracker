import React from 'react';
import Navbar from './Navbar';
import Head from 'next/head';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Управление проектами' }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Система управления цифровыми проектами" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-crypto-dark/80 backdrop-blur-md border-t border-glass-border py-6">
          <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Система управления цифровыми проектами
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout; 