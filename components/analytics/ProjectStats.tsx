import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ProjectStatsProps {
  data: {
    name: string;
    value: number;
  }[];
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ data }) => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 157, 0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="#8892b0" 
            tick={{ fill: '#8892b0' }}
          />
          <YAxis 
            stroke="#8892b0" 
            tick={{ fill: '#8892b0' }}
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
            formatter={(value) => <span className="text-gray-300">{value}</span>}
          />
          <Bar 
            dataKey="value" 
            name="Количество" 
            fill="#00ff9d" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectStats;
