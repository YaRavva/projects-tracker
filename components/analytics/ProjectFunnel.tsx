import React from 'react';

interface ProjectFunnelProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const ProjectFunnel: React.FC<ProjectFunnelProps> = ({ data }) => {
  // Рассчитываем общее количество проектов
  const totalProjects = data.reduce((sum, item) => sum + item.value, 0);

  // Сортируем данные в порядке статусов: На рассмотрении -> Возвращен -> Отклонен -> Активный
  const sortedData = [...data].sort((a, b) => {
    const order = { 'На рассмотрении': 0, 'Возвращен': 1, 'Отклонен': 2, 'Активный': 3 };
    return (order[a.name as keyof typeof order] || 0) - (order[b.name as keyof typeof order] || 0);
  });

  // Добавляем процентное соотношение к данным
  const enhancedData = sortedData.map(item => ({
    ...item,
    percentage: totalProjects > 0 ? Math.round((item.value / totalProjects) * 100) : 0
  }));

  return (
    <div className="h-80 w-full flex flex-col justify-center">
      <div className="flex-grow flex flex-col justify-center items-center space-y-4">
        {enhancedData.map((item, index) => {
          // Рассчитываем ширину воронки (от 100% до 60%)
          const widthPercentage = 100 - (index * 20);

          return (
            <div
              key={`funnel-${index}`}
              className="relative w-full flex justify-center"
            >
              <div
                className="relative rounded-md py-3 text-center transition-all duration-1000 ease-out"
                style={{
                  width: `${widthPercentage}%`,
                  backgroundColor: item.color,
                  boxShadow: `0 0 15px ${item.color}40`
                }}
              >
                <div className="text-white font-medium">{item.name}</div>
                <div className="text-white text-sm">{item.value} проектов ({item.percentage}%)</div>

                {/* Стрелка вниз, если это не последний элемент */}
                {index < enhancedData.length - 1 && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <svg
                      width="24"
                      height="12"
                      viewBox="0 0 24 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white opacity-50"
                    >
                      <path d="M12 12L0 0H24L12 12Z" fill="currentColor" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Дополнительная информация о общем количестве */}
      <div className="text-center mt-4">
        <div className="text-sm text-gray-400">Всего проектов: <span className="text-cryptix-green font-medium">{totalProjects}</span></div>
      </div>
    </div>
  );
};

export default ProjectFunnel;
