import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { taskAPI, aiAPI } from '../api/axios';
import { useToast } from '../context/ToastContext';

const CreateTask = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      priority: 'MEDIUM',
      status: 'TODO',
    }
  });

  const titleValue = watch('title');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await taskAPI.create(data);
      toast.success('Task created successfully!');
      navigate('/tasks');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!titleValue?.trim()) {
      toast.warning('Please enter a task title first');
      return;
    }
    setAiLoading(true);
    try {
      const res = await aiAPI.generateTaskDetails({ title: titleValue });
      const data = res.data;
      setValue('description', data.description);
      setValue('priority', data.suggestedPriority);
      setValue('estimatedTimeHours', data.estimatedEffortHours);
      toast.success(data.aiGenerated ? 'AI-generated details applied!' : 'Fallback suggestions applied');
    } catch (err) {
      toast.error('AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Create Task</h1>
        <p className="text-slate-400">Add a new task with optional AI assistance</p>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title + AI Generate */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Prepare client presentation"
                {...register('title', { required: 'Title is required', maxLength: { value: 255, message: 'Max 255 characters' } })}
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={aiLoading}
                className="btn btn-secondary whitespace-nowrap"
              >
                {aiLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></span>
                    Generating...
                  </span>
                ) : (
                  <>✨ Generate With AI</>
                )}
              </button>
            </div>
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              rows={4}
              placeholder="Describe the task in detail..."
              {...register('description', { maxLength: { value: 5000, message: 'Max 5000 characters' } })}
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>

          {/* Priority + Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
              <select {...register('priority', { required: 'Priority is required' })}>
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

          {/* Due Date + Estimated Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
              <input type="date" {...register('dueDate')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Estimated Hours</label>
              <input
                type="number"
                min="1"
                max="100"
                placeholder="e.g., 4"
                {...register('estimatedTimeHours', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
            <button type="button" onClick={() => navigate('/tasks')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
