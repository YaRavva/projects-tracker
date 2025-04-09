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

  // Создаем сетку для тепловой карты
  const gridSize = Math.ceil(Math.sqrt(totalProjects));
  const cells = Array(gridSize * gridSize).fill(null);
  
  // Заполняем сетку данными
  let cellIndex = 0;
  enhancedData.forEach(item => {
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
      <div className="mt-4 flex justify-center space-x-4">
        {enhancedData.map((item, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-sm mr-1"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-300">{item.name} ({item.value})</span>
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
