import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector, Legend } from 'recharts';

interface EnhancedPieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

// Компонент для активного сектора с анимацией
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#fff" fontSize={16} fontWeight="bold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#8892b0" fontSize={12}>
        {`${value} (${(percent * 100).toFixed(0)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke={fill}
        strokeWidth={2}
        strokeLinecap="round"
        className="sector-highlight"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 15}
        outerRadius={outerRadius + 18}
        fill={fill}
        stroke={fill}
        strokeWidth={1}
        strokeLinecap="round"
        strokeDasharray="3 3"
      />
    </g>
  );
};

// Кастомный компонент легенды
const CustomLegend = (props: any) => {
  const { payload } = props;

  return (
    <ul className="flex flex-col space-y-2 mt-4">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center">
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-300 text-sm">{entry.value}: </span>
          <span className="text-white text-sm font-medium ml-1">{entry.payload.value}</span>
        </li>
      ))}
    </ul>
  );
};

const EnhancedPieChart: React.FC<EnhancedPieChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Рассчитываем общее количество для отображения в центре
  const totalProjects = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-80 w-full">
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                onMouseEnter={onPieEnter}
                paddingAngle={3}
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
                isAnimationActive={true}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={1}
                  />
                ))}
              </Pie>
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
                content={<CustomLegend />}
                layout="vertical"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Дополнительная информация о общем количестве */}
        <div className="text-center mt-2">
          <div className="text-sm text-gray-400">Всего проектов: <span className="text-cryptix-green font-medium">{totalProjects}</span></div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPieChart;
