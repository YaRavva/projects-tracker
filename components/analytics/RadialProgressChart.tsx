import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip, PolarAngleAxis } from 'recharts';

interface RadialProgressChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const RadialProgressChart: React.FC<RadialProgressChartProps> = ({ data }) => {
  // Преобразуем данные для RadialBarChart и сортируем по убыванию значения
  const chartData = data
    .map((item, index) => ({
      name: item.name,
      value: item.value,
      fill: item.color,
      // Добавляем внутренний и внешний радиус для каждого сегмента
      innerRadius: 60 + index * 20,
      outerRadius: 80 + index * 20,
    }))
    .sort((a, b) => b.value - a.value); // Сортируем по убыванию для лучшего отображения

  // Добавляем общее количество для отображения в центре
  const totalProjects = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-80 w-full relative">
      {/* Отображаем общее количество проектов в центре */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
        <div className="text-3xl font-bold text-white">{totalProjects}</div>
        <div className="text-xs text-gray-400">Всего проектов</div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={140}
          barSize={15}
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 'auto']}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={8}
            label={{
              position: 'insideStart',
              fill: '#fff',
              fontWeight: 'bold',
              fontSize: 12,
              formatter: (value: number) => `${value}`
            }}
            angleAxisId={0}
            data={chartData}
            animationBegin={200}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <Tooltip
            formatter={(value) => [`${value}`, 'Количество']}
            contentStyle={{
              backgroundColor: 'rgba(4, 10, 15, 0.8)',
              borderColor: 'rgba(0, 255, 157, 0.2)',
              color: '#fff',
              borderRadius: '4px',
              boxShadow: '0 4px 30px rgba(0, 255, 157, 0.1)'
            }}
          />
          <Legend
            iconSize={10}
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{
              paddingLeft: '10px',
            }}
            formatter={(value) => <span className="text-gray-300">{value}</span>}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadialProgressChart;
