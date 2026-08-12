import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { taskAPI, aiAPI } from '../api/axios';
import { useToast } from '../context/ToastContext';
import Loading from '../components/ui/Loading';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();

  const titleValue = watch('title');

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const res = await taskAPI.getById(id);
      const task = res.data;
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate || '',
        estimatedTimeHours: task.estimatedTimeHours || '',
      });
    } catch {
      toast.error('Failed to load task');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await taskAPI.update(id, data);
      toast.success('Task updated!');
      navigate(`/tasks/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!titleValue?.trim()) {
      toast.warning('Enter a title first');
      return;
    }
    setAiLoading(true);
    try {
      const res = await aiAPI.generateTaskDetails({ title: titleValue });
      setValue('description', res.data.description);
      setValue('priority', res.data.suggestedPriority);
      setValue('estimatedTimeHours', res.data.estimatedEffortHours);
      toast.success('AI suggestions applied');
    } catch {
      toast.error('AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <Loading text="Loading task..." />;

  return (
    <div className="animate-fadeIn max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Edit Task</h1>
        <p className="text-slate-400">Modify task details</p>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
            <div className="flex gap-2">
              <input type="text" {...register('title', { required: 'Title is required' })} className="flex-1" />
              <button type="button" onClick={handleAIGenerate} disabled={aiLoading} className="btn btn-secondary whitespace-nowrap">
                {aiLoading ? 'Generating...' : '✨ Generate With AI'}
              </button>
            </div>
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea rows={4} {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
              <select {...register('priority', { required: true })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select {...register('status')}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
              <input type="date" {...register('dueDate')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Estimated Hours</label>
              <input type="number" min="1" max="100" {...register('estimatedTimeHours', { valueAsNumber: true })} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate(`/tasks/${id}`)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTask;
