import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FormType, Medication } from '../types';
import { Pill, Trash2, Edit2, Droplet, Syringe, Utensils, Plus, Save, X, PackagePlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const getIcon = (type: FormType) => {
  switch (type) {
    case FormType.INJECTION: return <Syringe className="text-purple-500" />;
    case FormType.SYRUP:
    case FormType.DROPS: return <Droplet className="text-blue-500" />;
    default: return <Pill className="text-emerald-500" />;
  }
};

export const Medications: React.FC = () => {
  const { medications, deleteMedication, updateMedication, refillMedication } = useApp();
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [refillMed, setRefillMed] = useState<Medication | null>(null);
  const [refillAmount, setRefillAmount] = useState<string>('');

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMed) {
      updateMedication(editingMed);
      setEditingMed(null);
    }
  };

  const handleRefillSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(refillAmount);
    if (refillMed && amount > 0) {
      refillMedication(refillMed.id, amount);
      setRefillMed(null);
      setRefillAmount('');
    }
  };

  const openRefillDialog = (med: Medication) => {
    setRefillMed(med);
    // Default to initial quantity if available, else empty
    setRefillAmount(med.initialQuantity > 0 ? med.initialQuantity.toString() : '');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Medications</h1>
        <Link to="/add-medication" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition">
          + Add New
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medications.map((med) => (
          <div key={med.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  {getIcon(med.formType)}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                   <button 
                    onClick={() => setEditingMed(med)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                   >
                     <Edit2 size={18} />
                   </button>
                   <button 
                    onClick={() => deleteMedication(med.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{med.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{med.dosage} • {med.frequency}</p>

              <div className="space-y-3">
                 {med.mealRelation && (
                   <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                      <Utensils size={14} className="text-gray-400" />
                      <span>{med.mealRelation}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-500 dark:text-gray-400">Form</span>
                   <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{med.formType}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 dark:text-gray-400">Inventory</span>
                   <div className="flex items-center gap-2">
                     <span className={`font-medium ${med.currentQuantity < 10 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                       {med.currentQuantity} left
                     </span>
                     <button 
                       onClick={() => openRefillDialog(med)}
                       title="Top up inventory"
                       className="p-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all transform active:scale-90"
                     >
                       <Plus size={14} strokeWidth={3} />
                     </button>
                   </div>
                 </div>
                 <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                    <div 
                      className={`h-1.5 rounded-full ${med.currentQuantity < 10 ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (med.currentQuantity / med.initialQuantity) * 100)}%` }}
                    />
                 </div>
              </div>
            </div>
            
            {med.instructions && (
              <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                  <span className="font-semibold">Note:</span> {med.instructions}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Refill Modal */}
      {refillMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
             <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-500">
               <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-full">
                 <PackagePlus size={24} />
               </div>
               <h2 className="text-lg font-bold text-gray-900 dark:text-white">Refill Medication</h2>
             </div>
             
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
               How many units of <span className="font-bold text-gray-800 dark:text-gray-200">{refillMed.name}</span> would you like to add?
             </p>

             <form onSubmit={handleRefillSave}>
               <div className="mb-6">
                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Quantity to Add</label>
                 <input 
                    type="number" 
                    min="1"
                    value={refillAmount}
                    onChange={(e) => setRefillAmount(e.target.value)}
                    className="w-full text-center text-3xl font-bold py-3 rounded-xl border-2 border-emerald-100 dark:border-emerald-900/50 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-0 outline-none"
                    autoFocus
                    required
                 />
               </div>

               <div className="flex gap-3">
                 <button 
                   type="button"
                   onClick={() => setRefillMed(null)}
                   className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none transition transform active:scale-95"
                 >
                   Add Stock
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Medication</h2>
              <button 
                onClick={() => setEditingMed(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medication Name</label>
                <input 
                  type="text" 
                  value={editingMed.name} 
                  onChange={(e) => setEditingMed({...editingMed, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dosage</label>
                  <input 
                    type="text" 
                    value={editingMed.dosage} 
                    onChange={(e) => setEditingMed({...editingMed, dosage: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                  <input 
                    type="text" 
                    value={editingMed.frequency} 
                    onChange={(e) => setEditingMed({...editingMed, frequency: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Stock</label>
                    <input 
                      type="number" 
                      value={editingMed.currentQuantity} 
                      onChange={(e) => setEditingMed({...editingMed, currentQuantity: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Package Size</label>
                    <input 
                      type="number" 
                      value={editingMed.initialQuantity} 
                      onChange={(e) => setEditingMed({...editingMed, initialQuantity: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructions</label>
                <textarea 
                  rows={3}
                  value={editingMed.instructions || ''} 
                  onChange={(e) => setEditingMed({...editingMed, instructions: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                <button 
                  type="button"
                  onClick={() => setEditingMed(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};