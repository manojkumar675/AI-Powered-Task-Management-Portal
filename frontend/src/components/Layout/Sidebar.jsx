import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/tasks', label: 'Tasks', icon: '📋' },
    { to: '/tasks/new', label: 'Create Task', icon: '➕' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex sticky top-0 h-screen w-64 shrink-0 glass border-r border-indigo-500/10 flex-col z-40">
        {/* Logo */}
        <div className="p-6 border-b border-indigo-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
              T
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">TaskPortal</h1>
              <p className="text-xs text-indigo-300/60">AI-Powered</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-indigo-500/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-indigo-500/10 z-50 flex justify-around p-2 pb-safe bg-[#0f172a]/90 backdrop-blur-md">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <span className="text-xl mb-1">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center p-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300"
        >
          <span className="text-xl mb-1">🚪</span>
          Logout
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
