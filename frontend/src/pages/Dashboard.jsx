import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../api/axios';
import Loading from '../components/ui/Loading';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Loading dashboard..." />;

  const cards = [
    {
      label: 'Total Tasks',
      value: stats?.totalTasks || 0,
      icon: '📋',
      gradient: 'from-indigo-500 to-indigo-600',
      shadow: 'shadow-indigo-500/20',
      bgAccent: 'bg-indigo-500/10',
    },
    {
      label: 'Completed',
      value: stats?.completedTasks || 0,
      icon: '✅',
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/20',
      bgAccent: 'bg-emerald-500/10',
    },
    {
      label: 'In Progress',
      value: stats?.inProgressTasks || 0,
      icon: '🔄',
      gradient: 'from-amber-500 to-amber-600',
      shadow: 'shadow-amber-500/20',
      bgAccent: 'bg-amber-500/10',
    },
    {
      label: 'Pending',
      value: stats?.pendingTasks || 0,
      icon: '📌',
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20',
      bgAccent: 'bg-blue-500/10',
    },
    {
      label: 'Overdue',
      value: stats?.overdueTasks || 0,
      icon: '⚠️',
      gradient: 'from-red-500 to-red-600',
      shadow: 'shadow-red-500/20',
      bgAccent: 'bg-red-500/10',
    },
  ];

  const completionRate = stats?.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Overview of your task management activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className="glass-card p-6 flex flex-col justify-between animate-fadeIn"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`w-12 h-12 rounded-xl ${card.bgAccent} flex items-center justify-center text-2xl mb-4`}>
              {card.icon}
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">{card.value}</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Completion Rate</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${completionRate * 3.14} ${314 - completionRate * 3.14}`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{completionRate}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">
                {stats?.completedTasks || 0} of {stats?.totalTasks || 0} tasks completed
              </p>
              {stats?.overdueTasks > 0 && (
                <p className="text-sm text-red-400">
                  ⚠ {stats.overdueTasks} overdue task{stats.overdueTasks > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Quick Actions</h2>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate('/tasks/new')}
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/10 hover:border-indigo-500/20 transition-all text-left"
            >
              <span className="text-2xl">➕</span>
              <div>
                <p className="text-sm font-medium text-white">Create New Task</p>
                <p className="text-xs text-slate-400">Add a new task with AI assistance</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/10 hover:border-purple-500/20 transition-all text-left"
            >
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-sm font-medium text-white">View All Tasks</p>
                <p className="text-xs text-slate-400">Browse and manage your tasks</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
