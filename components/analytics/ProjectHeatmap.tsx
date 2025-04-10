import React from 'react';

interface ProjectHeatmapProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const ProjectHeatmap: React.FC<ProjectHeatmapProps> = ({ data }) => {
  // Рассчитываем общее количество проектов
  const totalProjects = data.reduce((sum, item) => sum + item.value, 0);

  // Добавляем процентное соотношение к данным
  const enhancedData = data.map(item => ({
    ...item,
    percentage: totalProjects > 0 ? Math.round((item.value / totalProjects) * 100) : 0
  }));

  // Сортируем данные в порядке статусов: На рассмотрении -> Возвращен -> Отклонен -> Активный -> Завершен
  const sortedData = [...enhancedData].sort((a, b) => {
    const order = { 'На рассмотрении': 0, 'Возвращен': 1, 'Отклонен': 2, 'Активный': 3, 'Завершен': 4 };
    return (order[a.name as keyof typeof order] || 0) - (order[b.name as keyof typeof order] || 0);
  });

  // Создаем сетку для тепловой карты
  const gridSize = Math.ceil(Math.sqrt(totalProjects));
  const cells = Array(gridSize * gridSize).fill(null);

  // Заполняем сетку данными
  let cellIndex = 0;
  sortedData.forEach(item => {
    for (let i = 0; i < item.value; i++) {
      if (cellIndex < cells.length) {
        cells[cellIndex] = item;
        cellIndex++;
      }
    }
  });

  return (
    <div className="h-80 w-full flex flex-col">
      <div className="flex-grow">
        <div
          className="grid gap-1 h-full"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`
          }}
        >
          {cells.map((cell, index) => (
            <div
              key={`cell-${index}`}
              className="rounded-sm transition-all duration-500 ease-out"
              style={{
                backgroundColor: cell ? cell.color : 'rgba(0,0,0,0.1)',
                opacity: cell ? 1 : 0.2,
                transform: `scale(${cell ? 1 : 0.8})`,
              }}
              title={cell ? `${cell.name}: ${cell.value} проектов` : 'Нет проекта'}
            />
          ))}
        </div>
      </div>

      {/* Легенда */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {sortedData.map((item, index) => (
          <div key={`legend-${index}`} className="flex items-center bg-crypto-black/30 border border-glass-border rounded-md px-2 py-1">
            <div
              className="w-3 h-3 rounded-sm mr-1"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-white">{item.name}</span>
            <span className="text-xs ml-1" style={{ color: item.color }}>({item.value})</span>
          </div>
        ))}
      </div>

      {/* Дополнительная информация о общем количестве */}
      <div className="text-center mt-2">
        <div className="text-sm text-gray-400">Всего проектов: <span className="text-cryptix-green font-medium">{totalProjects}</span></div>
      </div>
    </div>
  );
};

export default ProjectHeatmap;
