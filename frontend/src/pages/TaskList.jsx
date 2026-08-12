import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { taskAPI } from '../api/axios';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('createdAt,desc');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchTasks();
  }, [page, status, priority, sort, search]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let res;
      if (search) {
        res = await taskAPI.search({ keyword: search, page, size: 10 });
      } else {
        const params = { page, size: 10, sort };
        if (status) params.status = status;
        if (priority) params.priority = priority;
        res = await taskAPI.getAll(params);
      }
      setTasks(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskAPI.delete(id);
      toast.success('Task deleted');
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await taskAPI.updateStatus(id, { status: newStatus });
      toast.success('Status updated');
      fetchTasks();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (dueDate, taskStatus) => {
    if (!dueDate || taskStatus === 'DONE') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Tasks</h1>
          <p className="text-slate-400 text-sm">{totalElements} task{totalElements !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/tasks/new" className="btn btn-primary">
          <span>➕</span> New Task
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-sm"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            </div>
          </form>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); setSearch(''); setSearchInput(''); }}
            className="w-full md:w-auto text-sm py-2"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          {/* Priority filter */}
          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(0); setSearch(''); setSearchInput(''); }}
            className="w-full md:w-auto text-sm py-2"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(0); }}
            className="w-full md:w-auto text-sm py-2"
          >
            <option value="createdAt,desc">Newest First</option>
            <option value="createdAt,asc">Oldest First</option>
            <option value="dueDate,asc">Due Date ↑</option>
            <option value="dueDate,desc">Due Date ↓</option>
            <option value="priority,desc">Priority ↓</option>
            <option value="priority,asc">Priority ↑</option>
          </select>
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <Loading text="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No tasks found"
          description={search ? 'Try a different search term' : 'Create your first task to get started'}
          action={
            !search && (
              <Link to="/tasks/new" className="btn btn-primary">
                Create First Task
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {tasks.map((task, i) => (
              <div
                key={task.id}
                className="glass-card p-3 sm:px-4 sm:py-3 flex flex-col md:flex-row md:items-center gap-4 animate-fadeIn cursor-pointer hover:bg-white/5 transition-colors"
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                {/* Status Quick Toggle */}
                <div onClick={(e) => e.stopPropagation()} className="shrink-0 w-full md:w-auto">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="w-full md:w-[110px] text-xs py-1.5 px-2 bg-slate-900/80"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold truncate ${task.status === 'DONE' ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    {isOverdue(task.dueDate, task.status) && (
                      <span className="text-[10px] uppercase tracking-wider bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/20 shrink-0">Overdue</span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>

                {/* Due Date & Effort */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 md:w-24 gap-2 md:gap-0">
                  {task.dueDate ? (
                    <span className={`text-xs ${isOverdue(task.dueDate, task.status) ? 'text-red-400' : 'text-slate-300'}`}>
                      {formatDate(task.dueDate)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                  {task.estimatedTimeHours && (
                    <span className="text-[10px] text-slate-500">{task.estimatedTimeHours}h</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/tasks/${task.id}/edit`)}
                    className="btn btn-ghost p-1.5 text-slate-400 hover:text-white"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="btn btn-ghost p-1.5 text-slate-400 hover:text-red-400"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn btn-secondary text-xs px-3 py-2"
              >
                ← Previous
              </button>
              <span className="text-sm text-slate-400 px-4">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn btn-secondary text-xs px-3 py-2"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskList;
