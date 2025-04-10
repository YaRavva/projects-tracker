import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface RadialProgressProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const RadialProgress: React.FC<RadialProgressProps> = ({ data }) => {
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

  // Кастомный компонент легенды - компактный вариант
  const CustomLegend = (props: any) => {
    const { payload } = props;

    return (
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {payload.map((entry: any, index: number) => {
          const dataItem = sortedData.find(item => item.name === entry.value);
          const value = dataItem?.value || 0;
          const percentage = dataItem?.percentage || 0;

          return (
            <div
              key={`item-${index}`}
              className="flex items-center bg-crypto-black/30 border border-glass-border rounded-md px-2 py-1"
            >
              <div
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white text-xs">{entry.value}</span>
              <span className="text-xs font-bold mx-1" style={{ color: entry.color }}>{value}</span>
              <span className="text-gray-400 text-xs">({percentage}%)</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-80 w-full">
      <div className="flex flex-col h-full">
        {/* Увеличиваем размер диаграммы */}
        <div className="flex-grow" style={{ height: '80%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sortedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
                label={({ name, value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {sortedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Компактная легенда внизу */}
        <div className="mt-2">
          <CustomLegend payload={sortedData.map(item => ({ value: item.name, color: item.color }))} />
        </div>
      </div>
    </div>
  );
};

export default RadialProgress;
