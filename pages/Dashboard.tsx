import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Check, X, AlertTriangle, Droplets, Pill, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, schedule, medications, markDose } = useApp();

  // Calculate stats
  const totalMeds = medications.length;
  const takenToday = schedule.filter(s => s.status === 'taken').length;
  const pendingToday = schedule.filter(s => s.status === 'pending').length;
  const adherence = schedule.length > 0 ? Math.round((takenToday / schedule.length) * 100) : 100;

  const chartData = [
    { name: 'Mon', taken: 4 },
    { name: 'Tue', taken: 5 },
    { name: 'Wed', taken: 3 },
    { name: 'Thu', taken: 6 },
    { name: 'Fri', taken: takenToday },
    { name: 'Sat', taken: 0 },
    { name: 'Sun', taken: 0 },
  ];

  const lowStockMeds = medications.filter(m => m.currentQuantity <= (m.initialQuantity * 0.25));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hello, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400">Here's your medication overview for today.</p>
        </div>
        <div className="flex gap-3">
           <Link to="/add-medication" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm">
             Add Medication
           </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors duration-200">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
            <Pill size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Meds</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMeds}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors duration-200">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
            <Droplets size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending Doses</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingToday}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors duration-200">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <Check size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Adherence</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{adherence}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Today's Schedule</h2>
          
          <div className="space-y-6">
            {schedule.length === 0 && <p className="text-gray-400 italic">No medications scheduled for today.</p>}
            {schedule.map((item) => {
              const med = medications.find(m => m.id === item.medicationId);
              if (!med) return null;

              return (
                <div key={item.id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      item.status === 'taken' ? 'bg-emerald-500' : 
                      item.status === 'skipped' ? 'bg-red-300 dark:bg-red-700' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                    <div className="w-0.5 flex-1 bg-gray-100 dark:bg-gray-700 my-1 group-last:hidden" />
                  </div>
                  <div className="flex-1 pb-6 group-last:pb-0">
                    <div className={`p-4 rounded-xl border transition-all ${
                      item.status === 'pending' 
                        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md' 
                        : 'bg-gray-50 dark:bg-gray-900/50 border-transparent opacity-75'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{med.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{med.dosage} • {item.time} {med.mealRelation && `• ${med.mealRelation}`}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'taken' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                          item.status === 'skipped' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                      
                      {item.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => markDose(item.id, 'taken')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
                          >
                            <Check size={16} /> Take
                          </button>
                          <button 
                             onClick={() => markDose(item.id, 'skipped')}
                             className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                          >
                            <X size={16} /> Skip
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Inventory & Chart */}
        <div className="space-y-8">
          
          {/* Inventory Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Low Stock Alerts</h2>
            {lowStockMeds.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">All inventory levels look good.</p>
            ) : (
              <div className="space-y-3">
                {lowStockMeds.map(med => (
                  <div key={med.id} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                    <AlertTriangle className="text-red-500 shrink-0" size={20} />
                    <div>
                      <p className="text-sm font-medium text-red-900 dark:text-red-200">{med.name}</p>
                      <p className="text-xs text-red-600 dark:text-red-300">{med.currentQuantity} remaining</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Adherence Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 h-64 transition-colors duration-200">
             <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Weekly Adherence</h2>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff'}}
                  />
                  <Bar dataKey="taken" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 4 ? '#10b981' : '#475569'} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
};