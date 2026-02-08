import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Medication, ScheduleItem, FormType, MealRelation } from '../types';

interface AppState {
  user: User | null;
  medications: Medication[];
  schedule: ScheduleItem[];
  showTour: boolean;
  darkMode: boolean;
  login: (email: string) => void;
  register: (name: string, email: string) => void;
  logout: () => void;
  endTour: () => void;
  toggleDarkMode: () => void;
  addMedication: (med: Medication) => void;
  updateMedication: (med: Medication) => void;
  deleteMedication: (id: string) => void;
  refillMedication: (id: string, amount: number) => void;
  markDose: (scheduleId: string, status: 'taken' | 'skipped') => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

// Mock Data for new users
const MOCK_MEDS: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    formType: FormType.TABLET,
    dosage: '10mg',
    currentQuantity: 14,
    initialQuantity: 30,
    frequency: 'Daily',
    mealRelation: MealRelation.WITH,
    instructions: 'Take with food in the morning',
    nextDose: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    active: true,
  },
  {
    id: '2',
    name: 'Metformin',
    formType: FormType.PILL,
    dosage: '500mg',
    currentQuantity: 45,
    initialQuantity: 60,
    frequency: '2x Daily',
    mealRelation: MealRelation.AFTER,
    instructions: 'Take with evening meal',
    nextDose: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
    active: true,
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize user from localStorage if available
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('medsync_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Initialize data states (empty first, populated by effect)
  const [medications, setMedications] = useState<Medication[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [showTour, setShowTour] = useState(false);
  
  // Dark mode logic
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Persist user to local storage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('medsync_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('medsync_user');
    }
  }, [user]);

  // Load User Data (Medications & Schedule)
  useEffect(() => {
    if (user) {
      const storageKey = `medsync_data_${user.email}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setMedications(parsed.medications || []);
          setSchedule(parsed.schedule || []);
        } catch (e) {
          console.error("Failed to parse saved data", e);
          setMedications(MOCK_MEDS);
          setSchedule([]);
        }
      } else {
        // First time user? Give them mock data to start with
        setMedications(MOCK_MEDS);
        setSchedule([]);
      }
      setIsDataLoaded(true);
    } else {
      // Clear data on logout
      setMedications([]);
      setSchedule([]);
      setIsDataLoaded(false);
    }
  }, [user]);

  // Save User Data whenever it changes
  useEffect(() => {
    if (user && isDataLoaded) {
      const storageKey = `medsync_data_${user.email}`;
      const dataToSave = {
        medications,
        schedule
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }
  }, [medications, schedule, user, isDataLoaded]);

  // Generate schedule for today if missing (and if we have meds)
  useEffect(() => {
    if (user && isDataLoaded && medications.length > 0 && schedule.length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const newSchedule: ScheduleItem[] = medications.map(med => ({
        id: `sch_${med.id}_${Date.now()}`,
        medicationId: med.id,
        time: new Date(med.nextDose || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
        date: todayStr
      }));
      setSchedule(newSchedule);
    }
  }, [user, isDataLoaded, medications, schedule.length]);

  const login = (email: string) => {
    const derivedName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const newUser = {
      id: email,
      name: derivedName,
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(derivedName)}&background=10b981&color=fff`
    };
    
    setUser(newUser);
    setShowTour(false);
  };

  const register = (name: string, email: string) => {
    const newUser = {
      id: email,
      name: name,
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`
    };
    setUser(newUser);
    setShowTour(true);
  };

  const logout = () => {
    setUser(null);
    setShowTour(false);
    localStorage.removeItem('medsync_user');
  };

  const endTour = () => setShowTour(false);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const addMedication = (med: Medication) => {
    setMedications(prev => [...prev, med]);
    const todayStr = new Date().toISOString().split('T')[0];
    setSchedule(prev => [...prev, {
        id: `sch_${med.id}_${Date.now()}`,
        medicationId: med.id,
        time: "09:00", 
        status: 'pending',
        date: todayStr
    }]);
  };

  const updateMedication = (med: Medication) => {
    setMedications(prev => prev.map(m => m.id === med.id ? med : m));
  };

  const deleteMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    // Also remove from schedule to keep it clean
    setSchedule(prev => prev.filter(s => s.medicationId !== id));
  };

  const refillMedication = (id: string, amount: number) => {
    setMedications(prev => prev.map(med => {
      if (med.id === id) {
        return { ...med, currentQuantity: med.currentQuantity + amount };
      }
      return med;
    }));
  };

  const markDose = (scheduleId: string, status: 'taken' | 'skipped') => {
    setSchedule(prev => prev.map(item => {
      if (item.id === scheduleId) {
        // Only deduct inventory if it wasn't already taken
        if (status === 'taken' && item.status !== 'taken') {
          const med = medications.find(m => m.id === item.medicationId);
          if (med) {
             updateMedication({...med, currentQuantity: Math.max(0, med.currentQuantity - 1)});
          }
        }
        return { ...item, status };
      }
      return item;
    }));
  };

  return (
    <AppContext.Provider value={{ user, medications, schedule, showTour, darkMode, login, register, logout, endTour, toggleDarkMode, addMedication, updateMedication, deleteMedication, refillMedication, markDose }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};