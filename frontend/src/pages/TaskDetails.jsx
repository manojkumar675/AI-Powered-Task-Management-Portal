import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskAPI } from '../api/axios';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import Loading from '../components/ui/Loading';
import { useToast } from '../context/ToastContext';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const res = await taskAPI.getById(id);
      setTask(res.data);
    } catch {
      toast.error('Task not found');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskAPI.delete(id);
      toast.success('Task deleted');
      navigate('/tasks');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await taskAPI.updateStatus(id, { status: newStatus });
      toast.success('Status updated');
      fetchTask();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const formatDateTime = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const isOverdue = task?.dueDate && task?.status !== 'DONE' && new Date(task.dueDate) < new Date();

  if (loading) return <Loading text="Loading task..." />;
  if (!task) return null;

  return (
    <div className="animate-fadeIn max-w-3xl">
      {/* Back button */}
      <Link to="/tasks" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors mb-6">
        ← Back to Tasks
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{task.title}</h1>
            {isOverdue && (
              <span className="text-xs bg-red-500/20 text-red-300 px-2.5 py-1 rounded-full border border-red-500/20">
                Overdue
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/tasks/${id}/edit`)} className="btn btn-secondary">
            ✏️ Edit
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Description</h2>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {task.description || 'No description provided.'}
            </p>
          </div>

          {/* Status Actions */}
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Update Status</h2>
            <div className="flex flex-wrap gap-4">
              {['TODO', 'IN_PROGRESS', 'DONE'].map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`btn text-xs px-4 py-2 ${task.status === s ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {s === 'TODO' ? '📌 To Do' : s === 'IN_PROGRESS' ? '🔄 In Progress' : '✅ Done'}
                </button>
              ))}
            </div>
          </div>

          {/* Blockchain History Link */}
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Audit Trail</h2>
            <p className="text-sm text-slate-400 mb-4">View the blockchain-verified history of changes for this task.</p>
            <Link to={`/tasks/${id}/history`} className="btn btn-secondary">
              🔗 View Blockchain History
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 lg:p-8">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">Due Date</p>
                <p className={`text-sm font-medium ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                  {formatDate(task.dueDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Estimated Effort</p>
                <p className="text-sm font-medium text-white">
                  {task.estimatedTimeHours ? `${task.estimatedTimeHours} hours` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Owner</p>
                <p className="text-sm font-medium text-white">{task.ownerName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Created</p>
                <p className="text-sm text-slate-300">{formatDateTime(task.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Updated</p>
                <p className="text-sm text-slate-300">{formatDateTime(task.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
