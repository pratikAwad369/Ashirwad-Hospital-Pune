import React, { useState, useEffect } from 'react';
import { History, Shield, Clock, User, ArrowDownCircle } from 'lucide-react';
import { api } from '../../api';
import type { AuditLog } from '../../types';

export const AuditLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getAuditLogs(100)
      .then((res) => setLogs(res.logs || []))
      .catch((err) => console.error('Error fetching audit logs:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-600" />
            <span>Administrative Audit Log</span>
          </h3>
          <p className="text-xs text-slate-500">
            Immutable log of appointment bookings, status changes, schedule updates, and system operations.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Timestamp (UTC/IST)</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity</th>
              <th className="py-3 px-4">Performed By</th>
              <th className="py-3 px-4">Event Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[10px] bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-md uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{log.entityType}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{log.performedBy}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
