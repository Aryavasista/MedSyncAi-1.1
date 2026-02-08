import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { analyzePrescription, extractMedicationFromText } from '../services/geminiService';
import { FormType, Medication, MealRelation } from '../types';
import { Camera, Upload, Loader2, Save, X, Utensils, MessageSquareText, Send, CheckCircle, RotateCcw, ArrowRight, Trash2, AlertTriangle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DetectedMedication extends Partial<Medication> {
  confidence?: number;
  tempId: string;
}

export const AddMedication: React.FC = () => {
  const { addMedication } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'ai' | 'chat' | 'manual'>('ai');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{base64: string, mimeType: string} | null>(null);
  const [chatInput, setChatInput] = useState('');
  
  // Staging state for AI detection results
  const [detectedMeds, setDetectedMeds] = useState<DetectedMedication[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);

  // Manual Form State
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [formType, setFormType] = useState<FormType>(FormType.TABLET);
  const [mealRelation, setMealRelation] = useState<MealRelation | undefined>(undefined);
  const [frequency, setFrequency] = useState('Daily');
  const [quantity, setQuantity] = useState('30');
  const [instructions, setInstructions] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supportedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];
    if (!supportedTypes.includes(file.type)) {
      alert(`Unsupported file format (${file.type}). Please upload a PNG, JPEG, WEBP, or HEIC image.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      setSelectedFile({ base64: base64.split(',')[1], mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const results = await analyzePrescription(selectedFile.base64, selectedFile.mimeType);
      
      const mappedResults: DetectedMedication[] = results.map((data: any, index: number) => ({
        tempId: `temp_${Date.now()}_${index}`,
        name: data.name || 'Unknown Medication',
        dosage: data.dosage || '',
        formType: Object.values(FormType).includes(data.formType as FormType) ? data.formType as FormType : FormType.OTHER,
        frequency: data.frequency || 'Daily',
        // Initialize quantity to 0/empty to force user input as requested
        initialQuantity: 0,
        currentQuantity: 0,
        instructions: data.instructions || '',
        mealRelation: Object.values(MealRelation).includes(data.mealRelation as MealRelation) ? data.mealRelation as MealRelation : undefined,
        active: true,
        confidence: data.confidence || 0
      }));

      setDetectedMeds(mappedResults);
      setIsReviewing(true);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image. Please ensure it is a clear photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateDetectedMed = (id: string, field: keyof DetectedMedication, value: any) => {
    setDetectedMeds(prev => prev.map(med => 
      med.tempId === id ? { ...med, [field]: value, currentQuantity: field === 'initialQuantity' ? value : med.currentQuantity } : med
    ));
  };

  const handleRemoveDetectedMed = (id: string) => {
    setDetectedMeds(prev => prev.filter(m => m.tempId !== id));
    if (detectedMeds.length <= 1) {
      // If they remove the last one, maybe go back or stay? Stay for now.
    }
  };

  const handleSaveAllDetected = () => {
    // Validation
    const invalidQty = detectedMeds.find(m => !m.initialQuantity || m.initialQuantity <= 0);
    if (invalidQty) {
      alert(`Please enter the quantity for ${invalidQty.name}`);
      return;
    }

    detectedMeds.forEach(med => {
      const newMed: Medication = {
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        name: med.name!,
        dosage: med.dosage!,
        formType: med.formType as FormType,
        frequency: med.frequency!,
        initialQuantity: Number(med.initialQuantity),
        currentQuantity: Number(med.initialQuantity),
        instructions: med.instructions,
        mealRelation: med.mealRelation as MealRelation,
        active: true,
        nextDose: new Date().toISOString()
      };
      addMedication(newMed);
    });
    navigate('/medications');
  };

  const handleResetImage = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setIsReviewing(false);
    setDetectedMeds([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const populateForm = (data: any) => {
    if (data.name) setName(data.name);
    if (data.dosage) setDosage(data.dosage);
    if (data.formType) setFormType(data.formType as FormType);
    if (data.mealRelation) setMealRelation(data.mealRelation as MealRelation);
    if (data.frequency) setFrequency(data.frequency);
    if (data.totalQuantity) setQuantity(data.totalQuantity.toString());
    if (data.instructions) setInstructions(data.instructions);
    
    setActiveTab('manual');
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setIsAnalyzing(true);
    try {
      const data = await extractMedicationFromText(chatInput);
      populateForm(data);
    } catch (error) {
      alert("I couldn't quite understand that. Please try again or enter details manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMed: Medication = {
      id: Date.now().toString(),
      name,
      dosage,
      formType,
      frequency,
      initialQuantity: parseInt(quantity) || 30,
      currentQuantity: parseInt(quantity) || 30,
      instructions,
      mealRelation: showMealOption ? mealRelation : undefined,
      active: true,
      nextDose: new Date().toISOString()
    };
    addMedication(newMed);
    navigate('/medications');
  };

  // Specific types that require meal relation prompt
  const showMealOption = [
    FormType.PILL, 
    FormType.TABLET, 
    FormType.CAPSULE, 
    FormType.SYRUP, 
    FormType.DROPS, 
    FormType.INJECTION
  ].includes(formType);

  // Reset meal relation if type changes to hidden
  useEffect(() => {
    if (!showMealOption) {
      setMealRelation(undefined);
    }
  }, [showMealOption]);

  const renderConfidenceBadge = (score?: number) => {
    if (score === undefined) return null;
    let colorClass = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    let label = 'Low Confidence';
    if (score >= 80) {
      colorClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      label = 'High Confidence';
    } else if (score >= 50) {
      colorClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      label = 'Medium Confidence';
    }
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorClass}`}>
        {score}% • {label}
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Medication</h1>

      {/* Tabs */}
      {!isReviewing && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 transition-colors duration-200">
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            <button 
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'ai' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              Scan Label
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'chat' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
               Chat Assistant
            </button>
            <button 
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'manual' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
               Manual Entry
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'ai' && (
              <div className="text-center">
                {!previewUrl ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-700 transition cursor-pointer flex flex-col items-center justify-center group"
                  >
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Camera size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Scan Prescription or Label</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Upload a clear image of your medication bottle or doctor's prescription.</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/png, image/jpeg, image/webp, image/heic, image/heif"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 inline-block shadow-lg">
                      <img src={previewUrl} alt="Preview" className="max-h-64 object-contain bg-black/5 dark:bg-white/5" />
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                          <Loader2 className="w-10 h-10 animate-spin mb-2" />
                          <span className="font-medium">Analyzing...</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button 
                        onClick={handleResetImage}
                        disabled={isAnalyzing}
                        className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium flex items-center gap-2 transition disabled:opacity-50"
                      >
                        <RotateCcw size={18} />
                        Retake
                      </button>
                      <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-200 dark:shadow-none flex items-center gap-2 transition disabled:opacity-50 min-w-[200px] justify-center"
                      >
                         {isAnalyzing ? (
                           <>Thinking...</>
                         ) : (
                           <>
                             Analyze Image
                             <ArrowRight size={18} />
                           </>
                         )}
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-6">Powered by Gemini Vision AI</p>
              </div>
            )}

            {activeTab === 'chat' && (
               <div className="max-w-md mx-auto">
                 <div className="text-center mb-6">
                   <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <MessageSquareText size={32} />
                   </div>
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tell me about your medication</h3>
                   <p className="text-gray-500 dark:text-gray-400">Describe what you need to take, and I'll fill out the form for you.</p>
                 </div>
                 
                 <form onSubmit={handleChatSubmit} className="relative">
                    <textarea 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="e.g., I need to take 500mg of Metformin twice a day with meals."
                      className="w-full px-4 py-4 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none min-h-[120px] resize-none"
                      disabled={isAnalyzing}
                    />
                    <button 
                      type="submit"
                      disabled={isAnalyzing || !chatInput.trim()}
                      className="absolute bottom-3 right-3 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                       {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                 </form>
               </div>
            )}

            {activeTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medication Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Amoxicillin" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dosage</label>
                    <input type="text" value={dosage} onChange={e => setDosage(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 500mg" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Form</label>
                    <select value={formType} onChange={e => setFormType(e.target.value as FormType)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                      {Object.values(FormType).map(type => (
                        <option key={type} value={type} className="capitalize">{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Quantity</label>
                    <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>

                {showMealOption && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Utensils size={16} />
                      When to take?
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.values(MealRelation).map((relation) => (
                        <button
                          key={relation}
                          type="button"
                          onClick={() => setMealRelation(relation)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                            mealRelation === relation 
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-medium' 
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-700'
                          }`}
                        >
                          {relation}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                  <input type="text" value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="e.g. Once daily after food" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instructions / Notes</label>
                  <textarea rows={3} value={instructions} onChange={e => setInstructions(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Any special instructions..." />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => navigate('/medications')} className="px-6 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition flex items-center gap-2">
                    <Save size={18} /> Save Medication
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Review Screen */}
      {isReviewing && detectedMeds.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 rounded-xl flex gap-3">
             <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg h-fit">
               <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
             </div>
             <div>
               <h3 className="font-bold text-gray-900 dark:text-white">Review Detected Medications</h3>
               <p className="text-sm text-gray-600 dark:text-gray-300">
                 We found {detectedMeds.length} medication{detectedMeds.length !== 1 ? 's' : ''}. Please confirm the details and enter the quantity for each.
               </p>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {detectedMeds.map((med) => (
              <div key={med.tempId} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 transition-all">
                <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <input 
                        value={med.name} 
                        onChange={(e) => handleUpdateDetectedMed(med.tempId!, 'name', e.target.value)}
                        className="font-bold text-lg text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none w-full"
                      />
                      {renderConfidenceBadge(med.confidence)}
                    </div>
                    <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <input 
                        value={med.dosage}
                        onChange={(e) => handleUpdateDetectedMed(med.tempId!, 'dosage', e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none w-20"
                      />
                      <span>•</span>
                      <span className="capitalize">{med.formType}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                      "{med.instructions}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number" 
                        value={med.initialQuantity || ''} 
                        onChange={(e) => handleUpdateDetectedMed(med.tempId!, 'initialQuantity', parseInt(e.target.value))}
                        placeholder="0"
                        className={`w-24 text-center font-bold text-lg rounded-lg border-2 p-1 outline-none transition-colors ${
                          !med.initialQuantity || med.initialQuantity <= 0 
                            ? 'border-red-300 bg-red-50 focus:border-red-500 dark:bg-red-900/20 dark:border-red-800' 
                            : 'border-gray-200 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600'
                        }`}
                      />
                    </div>
                    <button 
                      onClick={() => handleRemoveDetectedMed(med.tempId!)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      title="Remove"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
             <button 
                onClick={handleResetImage}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
             >
               Cancel
             </button>
             <button 
               onClick={handleSaveAllDetected}
               className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none flex items-center gap-2 transform active:scale-95 transition-all"
             >
               <Save size={20} />
               Save All Medications
             </button>
          </div>
        </div>
      )}
    </div>
  );
};