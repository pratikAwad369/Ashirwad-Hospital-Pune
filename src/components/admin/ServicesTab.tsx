import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api';
import type { Service, Doctor } from '../../types';

interface ServicesTabProps {
  doctors: Doctor[];
}

export const ServicesTab: React.FC<ServicesTabProps> = ({ doctors }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [savingService, setSavingService] = useState(false);

  const fetchServices = () => {
    setLoading(true);
    api
      .getAdminServices()
      .then((res) => setServices(res.services || []))
      .catch((err) => console.error('Error fetching admin services:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleTogglePublish = async (service: Service) => {
    try {
      await api.saveService({
        id: service.id,
        title: service.title,
        isPublished: !service.isPublished,
      });
      fetchServices();
    } catch (err: any) {
      alert(`Error toggling publish state: ${err.message}`);
    }
  };

  const handleToggleRequiresConfirmation = async (service: Service) => {
    try {
      await api.saveService({
        id: service.id,
        title: service.title,
        requiresHospitalConfirmation: !service.requiresHospitalConfirmation,
      });
      fetchServices();
    } catch (err: any) {
      alert(`Error updating confirmation status: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.deleteService(id);
      fetchServices();
    } catch (err: any) {
      alert(`Error deleting service: ${err.message}`);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title) return;
    setSavingService(true);
    try {
      await api.saveService(editingService as any);
      setEditingService(null);
      fetchServices();
    } catch (err: any) {
      alert(`Error saving service: ${err.message}`);
    } finally {
      setSavingService(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Medical Services & Consultation Directory</h3>
          <p className="text-xs text-slate-500">
            Manage public consultation offerings. Services marked with "Requires hospital confirmation" display an advisory badge to patients.
          </p>
        </div>

        <button
          onClick={() =>
            setEditingService({
              title: '',
              category: 'General OPD',
              description: '',
              durationMinutes: 15,
              isPublished: false,
              requiresHospitalConfirmation: true,
              assignedDoctorIds: [doctors[0]?.id || ''],
            })
          }
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Service Title & Category</th>
                <th className="py-3.5 px-4">Assigned Doctors</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Public Visibility</th>
                <th className="py-3.5 px-4">Confirmation Badge</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading services...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No services found. Click "Add New Service" above.
                  </td>
                </tr>
              ) : (
                services.map((srv) => {
                  const assignedDocs = doctors.filter((d) => srv.assignedDoctorIds?.includes(d.id));

                  return (
                    <tr key={srv.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 space-y-1">
                        <span className="font-bold text-slate-900 block text-sm">{srv.title}</span>
                        <span className="inline-block text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm font-semibold uppercase">
                          {srv.category}
                        </span>
                        <p className="text-[11px] text-slate-500 line-clamp-1 max-w-md">{srv.description}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {assignedDocs.map((d) => (
                            <span key={d.id} className="block text-slate-700 font-medium text-[11px]">
                              • {d.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {srv.durationMinutes} mins
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleTogglePublish(srv)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            srv.isPublished
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {srv.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{srv.isPublished ? 'Published' : 'Draft (Hidden)'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleRequiresConfirmation(srv)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            srv.requiresHospitalConfirmation
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>{srv.requiresHospitalConfirmation ? 'Requires Confirmation' : 'Fully Confirmed'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => setEditingService({ ...srv })}
                          className="p-1.5 text-slate-500 hover:text-sky-700 rounded-lg hover:bg-slate-100"
                          title="Edit Service"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(srv.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-base text-slate-900">
                {editingService.id ? 'Edit Service' : 'Add New Healthcare Service'}
              </h4>
              <button onClick={() => setEditingService(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Service Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diabetology Consultation & Diet Counseling"
                  value={editingService.title || ''}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.category || ''}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingService.durationMinutes || 15}
                    onChange={(e) =>
                      setEditingService({ ...editingService, durationMinutes: parseInt(e.target.value) || 15 })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="srv-pub"
                    checked={editingService.isPublished ?? false}
                    onChange={(e) => setEditingService({ ...editingService, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded-sm text-sky-600"
                  />
                  <label htmlFor="srv-pub" className="font-semibold text-slate-800 cursor-pointer">
                    Publish in Public Directory
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="srv-conf"
                    checked={editingService.requiresHospitalConfirmation ?? false}
                    onChange={(e) =>
                      setEditingService({ ...editingService, requiresHospitalConfirmation: e.target.checked })
                    }
                    className="w-4 h-4 rounded-sm text-amber-600"
                  />
                  <label htmlFor="srv-conf" className="font-semibold text-slate-800 cursor-pointer">
                    Label as "Requires hospital confirmation" (Draft review)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingService}
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {savingService ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
