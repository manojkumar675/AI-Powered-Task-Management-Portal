const PriorityBadge = ({ priority }) => {
  const config = {
    LOW: { label: 'Low', classes: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: '↓' },
    MEDIUM: { label: 'Medium', classes: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: '→' },
    HIGH: { label: 'High', classes: 'bg-red-500/20 text-red-300 border-red-500/30', icon: '↑' },
  };

  const { label, classes, icon } = config[priority] || config.MEDIUM;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${classes}`}>
      <span className="mr-1">{icon}</span>
      {label}
    </span>
  );
};

export default PriorityBadge;
