import React, { useEffect } from 'react';

const BackgroundDecorations: React.FC = () => {
  // Добавляем декоративные элементы при загрузке
  useEffect(() => {
    // Проверяем, не созданы ли уже декоративные элементы
    if (document.querySelectorAll('.network-node').length > 0) {
      return; // Элементы уже созданы, выходим
    }

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
        nodes.forEach(node => {
          if (document.body.contains(node)) {
            document.body.removeChild(node);
          }
        });
        lines.forEach(line => {
          if (document.body.contains(line)) {
            document.body.removeChild(line);
          }
        });
      };
    };

    const cleanup = createDecorations();
    return cleanup;
  }, []);

  return null; // Этот компонент не рендерит никакой UI
};

export default BackgroundDecorations;
