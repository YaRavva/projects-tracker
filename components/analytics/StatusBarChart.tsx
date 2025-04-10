import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface StatusBarChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const StatusBarChart: React.FC<StatusBarChartProps> = ({ data }) => {
  // Рассчитываем общее количество проектов
  const totalProjects = data.reduce((sum, item) => sum + item.value, 0);

  // Добавляем процентное соотношение к данным
  const enhancedData = data.map(item => ({
    ...item,
    percentage: totalProjects > 0 ? Math.round((item.value / totalProjects) * 100) : 0
  }));

  // Кастомный тултип
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-crypto-black/80 border border-glass-border p-3 rounded-md shadow-glass">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-cryptix-green">{`${data.value} проектов (${data.percentage}%)`}</p>
        </div>
      );
    }
    return null;
  };

  // Сортируем данные в порядке статусов: На рассмотрении -> Возвращен -> Отклонен -> Активный -> Завершен
  const sortedData = [...enhancedData].sort((a, b) => {
    const order = { 'На рассмотрении': 0, 'Возвращен': 1, 'Отклонен': 2, 'Активный': 3, 'Завершен': 4 };
    return (order[a.name as keyof typeof order] || 0) - (order[b.name as keyof typeof order] || 0);
  });

  // Кастомная метка для баров
  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, height, value } = props;

    // Не показываем метку, если значение равно 0
    if (value === 0) return null;

    // Находим процент из данных
    const dataItem = sortedData.find(item => item.value === value);
    const percentage = dataItem ? dataItem.percentage : 0;

    return (
      <g>
        {/* Значение в конце полосы */}
        <text
          x={x + width - 10}
          y={y + height / 2}
          fill="#FFFFFF"
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={14}
          fontWeight="bold"
        >
          {value}
        </text>

        {/* Процент в центре полосы */}
        <text
          x={x + width / 2}
          y={y + height / 2}
          fill="#000000"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={18}
          fontWeight="bold"
        >
          {`${percentage}%`}
        </text>
      </g>
    );
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          barSize={40}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis
            type="number"
            stroke="#8892b0"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#8892b0"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke={entry.color}
                strokeWidth={1}
              />
            ))}
            <LabelList dataKey="value" content={renderCustomizedLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Дополнительная информация о общем количестве */}
      <div className="text-center mt-2">
        <div className="text-sm text-gray-400">Всего проектов: <span className="text-cryptix-green font-medium">{totalProjects}</span></div>
      </div>
    </div>
  );
};

export default StatusBarChart;
