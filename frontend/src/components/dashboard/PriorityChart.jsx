import React from 'react';
import { Card } from '../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
  High: '#f43f5e',
  Medium: '#f59e0b',
  Low: '#10b981',
};

export const PriorityChart = ({ priorityData = {} }) => {
  const chartData = [
    { name: 'High Priority', value: priorityData.High || 0, color: COLORS.High },
    { name: 'Medium Priority', value: priorityData.Medium || 0, color: COLORS.Medium },
    { name: 'Low Priority', value: priorityData.Low || 0, color: COLORS.Low },
  ];

  return (
    <Card className="h-80 flex flex-col justify-between" hover={false}>
      <div className="mb-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Priority Distribution</h4>
        <p className="text-xs text-slate-500">Action items segmented by urgency</p>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
