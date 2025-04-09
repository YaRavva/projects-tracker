import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ActivityGraphProps {
  data: {
    date: string;
    projects: number;
    completed: number;
  }[];
}

const ActivityGraph: React.FC<ActivityGraphProps> = ({ data }) => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            dataKey="date"
            stroke="#8892b0"
            tick={{ fill: '#8892b0' }}
          />
          <YAxis
            stroke="#8892b0"
            tick={{ fill: '#8892b0' }}
          />
          <Tooltip
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
          <Line
            type="monotone"
            dataKey="projects"
            name="Созданные проекты"
            stroke="#00ff9d"
            activeDot={{ r: 8 }}
            strokeWidth={2}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="completed"
            name="Завершенные проекты"
            stroke="#7dffcb"
            strokeWidth={2}
            animationBegin={300}
            animationDuration={1500}
            animationEasing="ease-out"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityGraph;
