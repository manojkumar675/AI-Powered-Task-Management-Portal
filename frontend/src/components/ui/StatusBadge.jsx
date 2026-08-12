const StatusBadge = ({ status }) => {
  const config = {
    TODO: { label: 'To Do', classes: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
    IN_PROGRESS: { label: 'In Progress', classes: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    DONE: { label: 'Done', classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  };

  const { label, classes } = config[status] || config.TODO;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'DONE' ? 'bg-emerald-400' : status === 'IN_PROGRESS' ? 'bg-amber-400' : 'bg-slate-400'
      }`}></span>
      {label}
    </span>
  );
};

export default StatusBadge;
