import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Plus, X, ListFilter, Pizza, ShieldAlert, Check, Shield } from 'lucide-react';
import { Student, CafeteriaItem } from '../types';
import { CAFETERIA_MENU } from '../data';

interface DietaryControlsProps {
  student: Student;
  onUpdateStudent: (updated: Student) => void;
}

export default function DietaryControls({ student, onUpdateStudent }: DietaryControlsProps) {
  const [newAllergen, setNewAllergen] = useState('');
  const [activeTab, setActiveTab] = useState<'allergens' | 'menu'>('allergens');
  const [menuFilter, setMenuFilter] = useState<'all' | 'beverage' | 'snack' | 'meal' | 'dessert'>('all');

  // Allergy handlers
  const handleAddAllergen = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAllergy = newAllergen.trim();
    if (cleanAllergy && !student.allergies.some(a => a.toLowerCase() === cleanAllergy.toLowerCase())) {
      onUpdateStudent({
        ...student,
        allergies: [...student.allergies, cleanAllergy],
      });
      setNewAllergen('');
    }
  };

  const handleRemoveAllergen = (allergyToRemove: string) => {
    onUpdateStudent({
      ...student,
      allergies: student.allergies.filter((a) => a !== allergyToRemove),
    });
  };

  // Menu Restrictions handlers
  const toggleMenuRestriction = (itemName: string) => {
    const isRestricted = student.foodRestrictions.includes(itemName);
    const updatedRestrictions = isRestricted
      ? student.foodRestrictions.filter(item => item !== itemName)
      : [...student.foodRestrictions, itemName];

    onUpdateStudent({
      ...student,
      foodRestrictions: updatedRestrictions,
    });
  };

  // Filter cafeteria menu based on active filter
  const filteredMenu = CAFETERIA_MENU.filter(item => {
    if (menuFilter === 'all') return true;
    return item.category === menuFilter;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-6">
      {/* Header and Pill Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-1.5">
            <Pizza className="w-5 h-5 text-indigo-500" />
            Cafeteria & Health Controls
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Set health allergies and customize menu item locks scanner-side.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl self-start md:self-auto">
          <button
            id="dietary-tab-allergens"
            onClick={() => setActiveTab('allergens')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'allergens'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Allergies ({student.allergies.length})
          </button>
          <button
            id="dietary-tab-menu"
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'menu'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Menu Locks ({student.foodRestrictions.length})
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'allergens' ? (
          <motion.div
            key="allergens-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Warning card */}
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-amber-800">Critical Medical Allergies</h4>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Registered allergies are flashed in RED on the school cashiers visual display system. Any lunch meal labeled with these allergens will trigger a loud warning sound and lock checkout automatically.
                </p>
              </div>
            </div>

            {/* Current Allergies list */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 block">Registered High-Risk Allergies</label>
              
              {student.allergies.length === 0 ? (
                <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 font-medium text-xs">
                  No active physical allergies registered. Children can purchase all items.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {student.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full border border-red-100 shadow-xs"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                      {allergy}
                      <button
                        id={`remove-allergy-${allergy}-${student.id}`}
                        onClick={() => handleRemoveAllergen(allergy)}
                        className="p-0.5 hover:bg-red-100 rounded-full text-red-500 hover:text-red-800 transition-colors"
                        title="Remove Allergy"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Add new allergy form */}
            <form onSubmit={handleAddAllergen} className="flex gap-2">
              <input
                id={`add-allergen-input-${student.id}`}
                type="text"
                placeholder="e.g. Gluten, Mustard, Tree Nuts, Eggs"
                value={newAllergen}
                onChange={(e) => setNewAllergen(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-850"
              />
              <button
                id={`add-allergen-btn-${student.id}`}
                type="submit"
                disabled={!newAllergen.trim()}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Allergy
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="menu-locks-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Guide Info */}
            <p className="text-xs text-slate-500 leading-normal">
              Browse the Abbeys High School lunchroom catalog and block sugary or fast food choices. Locked items will fail validation on POS scans.
            </p>

            {/* Filters */}
            <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl">
              {(['all', 'meal', 'beverage', 'snack', 'dessert'] as const).map(f => (
                <button
                  id={`filter-menu-${f}`}
                  key={f}
                  onClick={() => setMenuFilter(f)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    menuFilter === f
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Menu List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {filteredMenu.map((item) => {
                const isRestricted = student.foodRestrictions.includes(item.name);
                const hasAllergenRisk = item.allergens.some(a => 
                  student.allergies.some(sa => sa.toLowerCase() === a.toLowerCase())
                );

                return (
                  <div
                    id={`menu-item-${item.id}`}
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex justify-between items-center ${
                      isRestricted 
                        ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                        : hasAllergenRisk 
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-white border-slate-105 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-xs">{item.name}</span>
                        <span className="text-[9px] font-mono font-medium tracking-wide bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                      
                      {/* Price and allergens alerts */}
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="font-bold text-slate-700 font-mono">${item.price.toFixed(2)}</span>
                        
                        {item.allergens.length > 0 && (
                          <span className="text-slate-400">
                            • contains {item.allergens.join(', ')}
                          </span>
                        )}

                        {hasAllergenRisk && (
                          <span className="text-red-500 font-semibold text-[9px] uppercase tracking-wide bg-red-100/50 px-1 rounded-sm">
                            ALLERGEN RISK
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Toggle Lock Action */}
                    <button
                      id={`lock-menu-item-${item.id}`}
                      onClick={() => toggleMenuRestriction(item.name)}
                      disabled={hasAllergenRisk}
                      className={`p-2 rounded-xl transition-all ${
                        hasAllergenRisk
                          ? 'bg-red-50 text-red-500 opacity-60 cursor-not-allowed'
                          : isRestricted
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                      title={hasAllergenRisk ? "Triggered automatically by medical allergy" : isRestricted ? "Click to unlock" : "Click to lock this item"}
                    >
                      {hasAllergenRisk ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : isRestricted ? (
                        <Shield className="w-4 h-4 fill-red-600" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
