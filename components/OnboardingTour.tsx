import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Pill, Camera, Calendar, Bot, ChevronRight, Check } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  {
    title: "Welcome to MedSync AI",
    description: "Your new intelligent assistant for medication management. Let's take a quick tour to get you started.",
    icon: Pill
  },
  {
    title: "AI-Powered Scanning",
    description: "Add medications effortlessly by scanning your prescription bottle or label using the 'Add Med' tab.",
    icon: Camera
  },
  {
    title: "Smart Scheduling",
    description: "Never miss a dose. View your daily timeline and get reminders in the 'Schedule' tab.",
    icon: Calendar
  },
  {
    title: "Medical Assistant",
    description: "Have questions about side effects? Chat with our advanced AI assistant anytime.",
    icon: Bot
  }
];

export const OnboardingTour: React.FC = () => {
  const { showTour, endTour } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  if (!showTour) return null;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  };

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[scaleIn_0.2s_ease-out]">
        
        {/* Header Image/Icon Area */}
        <div className="bg-emerald-600 p-8 flex justify-center items-center h-48 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
              </svg>
           </div>
           <div className="bg-white/20 p-6 rounded-full backdrop-blur-md shadow-inner">
             <StepIcon size={48} className="text-white" />
           </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{STEPS[currentStep].title}</h3>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
            {STEPS[currentStep].description}
          </p>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {STEPS.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? 'bg-emerald-600 w-6' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 group"
          >
            {currentStep === STEPS.length - 1 ? (
              <>Get Started <Check size={20} /></>
            ) : (
              <>Next Step <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};