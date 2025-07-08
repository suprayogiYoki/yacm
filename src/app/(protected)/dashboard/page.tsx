'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import DashboardCard from '@/components/dashboard/Card';

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome back, {user?.name}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon="👥"
        />
        <DashboardCard 
          title="Active Projects" 
          value={stats?.activeProjects || 0} 
          icon="📊"
        />
        <DashboardCard 
          title="Pending Tasks" 
          value={stats?.pendingTasks || 0} 
          icon="✅"
        />
      </div>

      {/* Recent Activity Section */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {/* Tambahkan komponen activity list di sini */}
      </section>
    </div>
  );
}