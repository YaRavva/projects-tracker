import React from 'react';

interface ProgressCardsProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const ProgressCards: React.FC<ProgressCardsProps> = ({ data }) => {
  // Рассчитываем общее количество проектов
  const totalProjects = data.reduce((sum, item) => sum + item.value, 0);
  
  // Добавляем процентное соотношение к данным
  const enhancedData = data.map(item => ({
    ...item,
    percentage: totalProjects > 0 ? Math.round((item.value / totalProjects) * 100) : 0
  }));

  return (
    <div className="h-80 w-full overflow-auto">
      <div className="grid grid-cols-1 gap-4">
        {enhancedData.map((item, index) => (
          <div 
            key={`progress-card-${index}`}
            className="bg-crypto-black/30 border border-glass-border rounded-lg p-4 flex flex-col"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-medium">{item.name}</h3>
              <span className="text-cryptix-green font-bold">{item.value}</span>
            </div>
            
            <div className="relative h-4 bg-crypto-black/50 rounded-full overflow-hidden mb-2">
              <div 
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${item.percentage}%`, 
                  backgroundColor: item.color,
                  boxShadow: `0 0 10px ${item.color}`
                }}
              />
            </div>
            
            <div className="text-right text-sm text-gray-400">
              {item.percentage}% от общего числа проектов
            </div>
          </div>
        ))}
      </div>
      
      {/* Дополнительная информация о общем количестве */}
      <div className="text-center mt-4">
        <div className="text-sm text-gray-400">Всего проектов: <span className="text-cryptix-green font-medium">{totalProjects}</span></div>
      </div>
    </div>
  );
};

export default ProgressCards;
