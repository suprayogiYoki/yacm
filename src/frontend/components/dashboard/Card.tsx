import React from 'react';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: 'up' | 'down';
}

export default function DashboardCard({ 
  title, 
  value, 
  icon,
  trend 
}: DashboardCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      {trend && (
        <div className={`mt-2 text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? '↑' : '↓'} 12% from last month
        </div>
      )}
    </div>
  );
}