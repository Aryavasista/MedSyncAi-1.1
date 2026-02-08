import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Pill, PlusCircle, Calendar, MessageSquareText, LogOut, User as UserIcon, Moon, Sun } from 'lucide-react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { OnboardingTour } from './OnboardingTour';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, darkMode, toggleDarkMode } = useApp();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Pill, label: 'Medications', path: '/medications' },
    { icon: PlusCircle, label: 'Add Med', path: '/add-medication' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
    { icon: MessageSquareText, label: 'AI Assistant', path: '/chat' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <OnboardingTour />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col transition-colors duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Pill className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-white">MedSync AI</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
           {/* Dark Mode Toggle in Sidebar */}
           <button 
             onClick={toggleDarkMode}
             className="w-full flex items-center gap-3 px-4 py-2 mb-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
           >
             {darkMode ? <Sun size={20} /> : <Moon size={20} />}
             <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
           </button>

          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
               {user.avatar ? <img src={user.avatar} alt="avatar" /> : <UserIcon className="w-6 h-6 m-2 text-gray-500 dark:text-gray-300"/>}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-50 px-4 py-3 flex justify-between items-center transition-colors duration-200">
         <span className="font-bold text-lg text-emerald-600 dark:text-emerald-500">MedSync AI</span>
         <div className="flex items-center gap-2">
            <button onClick={toggleDarkMode} className="p-2 text-gray-600 dark:text-gray-400">
               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={logout}><LogOut size={20} className="text-gray-600 dark:text-gray-400"/></button>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around p-2 z-50 transition-colors duration-200">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className={`p-2 rounded-lg ${location.pathname === item.path ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'text-gray-500 dark:text-gray-400'}`}>
            <item.icon size={24} />
          </Link>
        ))}
      </nav>
    </div>
  );
};