import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blockchainAPI } from '../api/axios';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

const BlockchainHistory = () => {
  const { id } = useParams();
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [id]);

  const fetchHistory = async () => {
    try {
      const res = await blockchainAPI.getHistory(id);
      setHistory(res.data);
    } catch {
      toast.error('Failed to load audit history');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await blockchainAPI.verify(id);
      setVerifyResult(res.data);
      if (res.data.valid) {
        toast.success('Blockchain integrity verified!');
      } else {
        toast.error('Integrity check failed!');
      }
    } catch {
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const formatDateTime = (dt) => {
    return new Date(dt).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const getActionConfig = (action) => {
    const configs = {
      TASK_CREATED: { icon: '🆕', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Created' },
      TASK_UPDATED: { icon: '✏️', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Updated' },
      TASK_DELETED: { icon: '🗑️', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Deleted' },
      TASK_COMPLETED: { icon: '✅', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Completed' },
      STATUS_CHANGED: { icon: '🔄', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Status Changed' },
    };
    return configs[action] || { icon: '📝', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: action };
  };

  const truncateHash = (hash) => {
    if (!hash || hash.length <= 16) return hash;
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  if (loading) return <Loading text="Loading audit history..." />;

  return (
    <div className="animate-fadeIn max-w-4xl">
      {/* Header */}
      <Link to={`/tasks/${id}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors mb-6">
        ← Back to Task
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Blockchain History</h1>
          <p className="text-slate-400 text-sm">{history.length} audit entries</p>
        </div>
        <button
          onClick={handleVerify}
          disabled={verifying || history.length === 0}
          className="btn btn-primary"
        >
          {verifying ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Verifying...
            </span>
          ) : (
            <>🔐 Verify Integrity</>
          )}
        </button>
      </div>

      {/* Verification Result */}
      {verifyResult && (
        <div className={`mb-6 p-4 rounded-lg border animate-fadeIn ${verifyResult.valid
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-red-500/10 border-red-500/20'
          }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{verifyResult.valid ? '✅' : '❌'}</span>
            <div>
              <p className={`font-semibold ${verifyResult.valid ? 'text-emerald-300' : 'text-red-300'}`}>
                {verifyResult.valid ? 'Integrity Verified' : 'Integrity Compromised'}
              </p>
              <p className="text-sm text-slate-400">{verifyResult.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* History Timeline */}
      {history.length === 0 ? (
        <EmptyState
          icon="🔗"
          title="No audit history"
          description="Audit entries will appear here as changes are made to this task"
        />
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-indigo-500/20"></div>

          <div className="space-y-4">
            {history.map((entry, i) => {
              const config = getActionConfig(entry.actionType);
              return (
                <div
                  key={entry.id}
                  className="relative pl-16 animate-fadeIn"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-3 w-7 h-7 rounded-full ${config.bg} border ${config.border} flex items-center justify-center text-sm`}>
                    {config.icon}
                  </div>

                  {/* Card */}
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400">{formatDateTime(entry.timestamp)}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${config.bg} ${config.color} border ${config.border}`}>
                        {entry.actionType}
                      </span>
                    </div>

                    {/* Hash details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-2 rounded bg-slate-900/50">
                        <p className="text-slate-500 mb-1">Payload Hash</p>
                        <p className="text-slate-300 font-mono break-all">{truncateHash(entry.payloadHash)}</p>
                      </div>
                      <div className="p-2 rounded bg-slate-900/50">
                        <p className="text-slate-500 mb-1">Previous Hash</p>
                        <p className="text-slate-300 font-mono break-all">
                          {entry.previousHash === '0' ? (
                            <span className="text-indigo-400">Genesis Block</span>
                          ) : truncateHash(entry.previousHash)}
                        </p>
                      </div>
                      <div className="p-2 rounded bg-slate-900/50">
                        <p className="text-slate-500 mb-1">Current Hash</p>
                        <p className="text-indigo-300 font-mono break-all">{truncateHash(entry.currentHash)}</p>
                      </div>
                    </div>

                    {/* Chain link indicator */}
                    {i < history.length - 1 && (
                      <div className="mt-4 text-center">
                        <span className="text-xs text-indigo-500/50">↓ chains to next block</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainHistory;
