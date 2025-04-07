import React, { useEffect } from 'react';
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
  // Добавляем декоративные элементы при загрузке
  useEffect(() => {
    // Создаем декоративные элементы
    const createDecorations = () => {
      // Создаем светящиеся узлы с логотипами технологий
      const nodes: HTMLDivElement[] = [];
      const nodePositions = [
        { left: '20%', top: '25%', icon: '/images/typescript-logo-styled.svg', alt: 'TypeScript' },
        { left: '80%', top: '30%', icon: '/images/javascript-logo-styled.svg', alt: 'JavaScript' },
        { left: '30%', top: '60%', icon: '/images/nextjs-logo-styled.svg', alt: 'Next.js' },
        { left: '70%', top: '65%', icon: '/images/react-logo-styled.svg', alt: 'React' },
      ];

      nodePositions.forEach(pos => {
        const node = document.createElement('div');
        node.className = 'network-node';
        node.style.left = pos.left;
        node.style.top = pos.top;
        node.innerHTML = `<img src="${pos.icon}" alt="${pos.alt}" class="w-full h-full object-contain" />`;
        document.body.appendChild(node);
        nodes.push(node);
      });

      // Создаем пунктирные линии между узлами
      const lines: HTMLDivElement[] = [];
      const lineConnections = [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
      ];

      lineConnections.forEach(conn => {
        const line = document.createElement('div');
        line.className = 'network-line';

        // Рассчитываем позицию и угол линии
        const fromPos = nodePositions[conn.from];
        const toPos = nodePositions[conn.to];

        // Преобразуем строковые проценты в числа
        const fromX = parseFloat(fromPos.left);
        const fromY = parseFloat(fromPos.top);
        const toX = parseFloat(toPos.left);
        const toY = parseFloat(toPos.top);

        // Рассчитываем длину и угол линии
        const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;

        // Устанавливаем линию между узлами
        line.style.left = fromPos.left;
        line.style.top = fromPos.top;
        line.style.width = `${distance}%`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = 'left center';
        line.style.opacity = '0.5';

        // Добавляем светящиеся точки на линии
        const dotsCount = Math.max(3, Math.floor(distance / 10));
        for (let i = 0; i < dotsCount; i++) {
          const dot = document.createElement('div');
          dot.className = 'network-dot';
          dot.style.left = `${(i / (dotsCount - 1)) * 100}%`;
          dot.style.animationDelay = `${i * 0.2}s`;
          line.appendChild(dot);
        }

        document.body.appendChild(line);
        lines.push(line);
      });

      // Удаляем элементы при размонтировании
      return () => {
        nodes.forEach(node => document.body.removeChild(node));
        lines.forEach(line => document.body.removeChild(line));
      };
    };

    const cleanup = createDecorations();
    return cleanup;
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Digital Projects Tracker - Manage your digital projects efficiently" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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