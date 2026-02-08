import React from 'react';
import { useApp } from '../context/AppContext';

export const Schedule: React.FC = () => {
  const { schedule, medications } = useApp();
  
  // Group by hour
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Schedule</h1>
        <div className="text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1 overflow-hidden flex flex-col transition-colors duration-200">
        <div className="overflow-y-auto flex-1 p-4">
          {hours.map(hour => {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const hourItems = schedule.filter(s => {
               // Very rough approximate check for demo
               return parseInt(s.time.split(':')[0]) === hour;
            });

            if (hour < 6 && hourItems.length === 0) return null; // Skip early morning empty hours

            return (
              <div key={hour} className="flex border-b border-gray-50 dark:border-gray-700 min-h-[80px]">
                <div className="w-20 py-4 text-right pr-4 text-xs font-medium text-gray-400 dark:text-gray-500 border-r border-gray-100 dark:border-gray-700">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                <div className="flex-1 p-2 relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                     <div className="h-1/2 border-b border-gray-50 dark:border-gray-700 border-dashed w-full"></div>
                  </div>
                  
                  {hourItems.map(item => {
                    const med = medications.find(m => m.id === item.medicationId);
                    if (!med) return null;
                    return (
                      <div key={item.id} className={`mb-2 p-2 rounded-lg text-sm border-l-4 shadow-sm relative z-10 ${
                        item.status === 'taken' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-900 dark:text-emerald-300' :
                        item.status === 'skipped' ? 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-900 dark:text-red-300' :
                        'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-900 dark:text-blue-300'
                      }`}>
                        <div className="font-semibold">{med.name}</div>
                        <div className="text-xs opacity-75">{med.dosage} • {item.time}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};