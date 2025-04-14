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

  // Сортируем данные в порядке статусов: На рассмотрении -> Возвращен -> Отклонен -> Активный -> Завершены
  const sortedData = [...enhancedData].sort((a, b) => {
    const order = { 'На рассмотрении': 0, 'Возвращен': 1, 'Отклонен': 2, 'Активный': 3, 'Завершены': 4 };
    return (order[a.name as keyof typeof order] || 0) - (order[b.name as keyof typeof order] || 0);
  });

  return (
    <div className="h-85 w-full overflow-auto">
      <div className="grid grid-cols-1 gap-1">
        {sortedData.map((item, index) => (
          <div
            key={`progress-card-${index}`}
            className="bg-crypto-black/30 border border-glass-border rounded-lg p-1 flex flex-col"
          >
            <div className="flex justify-between items-center w-full">
              <h3 className="text-white font-medium text-xs mr-1">{item.name}</h3>
              <span style={{ color: item.color }} className="font-bold text-xs shrink-0">{item.value}</span>
            </div>

            <div className="relative h-2 bg-crypto-black/50 rounded-full overflow-hidden my-0.5">
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                  boxShadow: `0 0 10px ${item.color}`
                }}
              />
            </div>

            <div className="text-right text-xs text-gray-400">
              {item.percentage}% от общего числа
            </div>
          </div>
        ))}
      </div>

      {/* Дополнительная информация о общем количестве */}
      <div className="text-center mt-1">
        <div className="text-xs text-gray-400">Всего проектов: <span className="text-cryptix-green font-medium">{totalProjects}</span></div>
      </div>
    </div>
  );
};

export default ProgressCards;
