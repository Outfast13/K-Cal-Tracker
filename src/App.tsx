import React, { useState, useEffect, useCallback } from 'react';
import {
  FoodItem,
  DiaryEntry,
  MealType,
  UserProfile,
  WeightEntry,
  WaterEntry,
  ExerciseEntry,
} from './types/index.ts';
import {
  getStoredFoods,
  getDiaryEntriesForDate,
  getUserProfile,
  addDiaryEntry,
  getTodayDateString,
  saveFoodItem,
  getAllWeightEntries,
  getWaterEntriesForDate,
  getExerciseEntriesForDate,
  saveUserProfile,
} from './data/storage.ts';
import { TodayTab } from './components/TodayTab.tsx';
import { DiaryTab } from './components/DiaryTab.tsx';
import { FoodsTab } from './components/FoodsTab.tsx';
import { ActivityTab } from './components/ActivityTab.tsx';
import { ProgressTab } from './components/ProgressTab.tsx';
import { Navigation, TabType } from './components/Navigation.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { DatabaseManagerModal } from './components/DatabaseManagerModal.tsx';
import { AndroidProjectTab } from './components/AndroidProjectTab.tsx';
import { BarcodeScannerModal } from './components/BarcodeScannerModal.tsx';
import { OcrScannerModal } from './components/OcrScannerModal.tsx';
import { FoodEditorModal } from './components/FoodEditorModal.tsx';
import { LogFoodModal } from './components/LogFoodModal.tsx';
import {
  Moon,
  Sun,
  Barcode,
  FileText,
  Utensils,
  WifiOff,
  X,
  Settings,
  Database,
  Smartphone,
  ChevronLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('today');
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Data states
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());

  // Modal states
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isOcrScannerOpen, setIsOcrScannerOpen] = useState(false);
  const [isScannerChoiceOpen, setIsScannerChoiceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDatabaseManagerOpen, setIsDatabaseManagerOpen] = useState(false);
  const [isAndroidProjectOpen, setIsAndroidProjectOpen] = useState(false);

  const [isFoodEditorOpen, setIsFoodEditorOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Partial<FoodItem> | null>(null);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [loggingFood, setLoggingFood] = useState<FoodItem | null>(null);
  const [loggingMealType, setLoggingMealType] = useState<MealType>('LUNCH');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Reload foods from storage
  const refreshFoods = useCallback(() => {
    setFoods(getStoredFoods());
  }, []);

  // Reload diary entries for selected date
  const refreshDiary = useCallback(() => {
    setDiaryEntries(getDiaryEntriesForDate(currentDate));
  }, [currentDate]);

  // Reload all tracker data
  const refreshAllData = useCallback(() => {
    refreshFoods();
    refreshDiary();
    setWeightEntries(getAllWeightEntries());
    setWaterEntries(getWaterEntriesForDate(currentDate));
    setExerciseEntries(getExerciseEntriesForDate(currentDate));
    setProfile(getUserProfile());
  }, [refreshFoods, refreshDiary, currentDate]);

  // Initial load
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Apply dark mode class to documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Trigger food logging
  const handleOpenLogModal = (food: FoodItem, mealType: MealType = 'LUNCH') => {
    setLoggingFood(food);
    setLoggingMealType(mealType);
    setIsLogModalOpen(true);
  };

  // Commit food log to diary
  const handleConfirmLog = (food: FoodItem, mealType: MealType, amount: number) => {
    const existing = foods.find((f) => f.id === food.id);
    if (!existing) {
      saveFoodItem(food);
      refreshFoods();
    }

    const scaleFactor = food.basis === '100G' ? amount / 100 : amount / (food.servingSize || 1);
    addDiaryEntry({
      foodId: food.id,
      foodName: food.name,
      brand: food.brand,
      mealType,
      loggedAmount: amount,
      loggedUnit: food.servingUnit,
      calories: Math.round(food.calories * scaleFactor),
      protein: Math.round(food.protein * scaleFactor * 10) / 10,
      carbs: Math.round(food.carbohydrates * scaleFactor * 10) / 10,
      fat: Math.round(food.fat * scaleFactor * 10) / 10,
      fiber: food.fiber ? Math.round(food.fiber * scaleFactor * 10) / 10 : 0,
      date: currentDate,
    });

    setIsLogModalOpen(false);
    setLoggingFood(null);
    refreshDiary();
    showToast(`Logged ${food.name} to ${mealType.toLowerCase()}!`);

    try {
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.8 },
      });
    } catch (e) {
      // Ignored
    }
  };

  // Duplicate a food
  const handleDuplicateFood = (food: FoodItem) => {
    const clone: FoodItem = {
      ...food,
      id: 'food_' + Date.now(),
      name: `${food.name} (Copy)`,
      barcode: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveFoodItem(clone);
    refreshFoods();
    showToast(`Duplicated "${food.name}"`);
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-150 antialiased">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setCurrentTab('today')}
              className="flex items-center gap-2.5 text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-teal-600/30">
                Kc
              </div>
              <div>
                <h1 className="font-black text-base tracking-tight leading-none text-zinc-900 dark:text-zinc-100">
                  KcalTracker
                </h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <WifiOff className="w-2.5 h-2.5" /> 100% Offline
                  </span>
                  <span className="text-[10px] text-zinc-400">• MyNetDiary Edition</span>
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Datasets Manager Button */}
            <button
              type="button"
              onClick={() => setIsDatabaseManagerOpen(true)}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Downloadable Offline Databases (Open Food Facts & USDA)"
              aria-label="Offline Databases"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Android Studio Source & APK Info */}
            <button
              type="button"
              onClick={() => setIsAndroidProjectOpen(true)}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="View Kotlin Source & Download Android Studio Project"
              aria-label="Android Source Code"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Settings & Profile Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Settings & Targets"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="max-w-xl mx-auto px-4 pt-4">
        {/* Full screen Android Project view if opened */}
        {isAndroidProjectOpen ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsAndroidProjectOpen(false)}
              className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 py-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <AndroidProjectTab />
          </div>
        ) : (
          <>
            {/* 1. Today Tab (MyNetDiary Dashboard) */}
            {currentTab === 'today' && (
              <TodayTab
                currentDate={currentDate}
                diaryEntries={diaryEntries}
                weightEntries={weightEntries}
                waterEntries={waterEntries}
                exerciseEntries={exerciseEntries}
                profile={profile}
                onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
                onOpenOcrScanner={() => setIsOcrScannerOpen(true)}
                onOpenAddFood={() => {
                  setLoggingMealType('LUNCH');
                  setCurrentTab('foods');
                }}
                onOpenAddWeight={() => setCurrentTab('progress')}
                onOpenAddExercise={() => setCurrentTab('activity')}
                onRefreshData={refreshAllData}
                onNavigateToTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {/* 2. Diary Tab */}
            {currentTab === 'diary' && (
              <DiaryTab
                currentDate={currentDate}
                onDateChange={(d) => setCurrentDate(d)}
                entries={diaryEntries}
                foods={foods}
                profile={profile}
                onOpenFoodPicker={(mealType) => {
                  setLoggingMealType(mealType);
                  setCurrentTab('foods');
                }}
                onRefreshEntries={refreshDiary}
              />
            )}

            {/* 3. Foods Tab */}
            {currentTab === 'foods' && (
              <FoodsTab
                foods={foods}
                onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
                onOpenOcrScanner={() => setIsOcrScannerOpen(true)}
                onAddNewFood={() => {
                  setEditingFood(null);
                  setIsFoodEditorOpen(true);
                }}
                onEditFood={(food) => {
                  setEditingFood(food);
                  setIsFoodEditorOpen(true);
                }}
                onLogFood={(food) => handleOpenLogModal(food, loggingMealType)}
                onDuplicateFood={handleDuplicateFood}
                onDeleteFood={() => {
                  refreshFoods();
                  showToast('Food deleted');
                }}
              />
            )}

            {/* 4. Activity Tab */}
            {currentTab === 'activity' && (
              <ActivityTab
                currentDate={currentDate}
                exerciseEntries={exerciseEntries}
                profile={profile}
                onRefreshData={refreshAllData}
              />
            )}

            {/* 5. Progress Tab */}
            {currentTab === 'progress' && (
              <ProgressTab
                weightEntries={weightEntries}
                profile={profile}
                onRefreshData={refreshAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      {!isAndroidProjectOpen && (
        <Navigation
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          onQuickScan={() => setIsScannerChoiceOpen(true)}
        />
      )}

      {/* Quick Scanner Choice Modal */}
      {isScannerChoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                  Choose Scanner
                </h4>
                <p className="text-xs text-zinc-400">Works 100% offline with zero cloud API</p>
              </div>
              <button
                type="button"
                onClick={() => setIsScannerChoiceOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsScannerChoiceOpen(false);
                  setIsBarcodeScannerOpen(true);
                }}
                className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 hover:border-teal-500 text-left transition flex flex-col justify-between h-32"
              >
                <Barcode className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Barcode Scanner
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Scan EAN/UPC or associate new food
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsScannerChoiceOpen(false);
                  setIsOcrScannerOpen(true);
                }}
                className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 hover:border-teal-500 text-left transition flex flex-col justify-between h-32"
              >
                <FileText className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Nutrition Label OCR
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Photograph nutrition facts table
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {isBarcodeScannerOpen && (
        <BarcodeScannerModal
          onClose={() => setIsBarcodeScannerOpen(false)}
          onFoodFound={(food) => {
            setIsBarcodeScannerOpen(false);
            handleOpenLogModal(food, loggingMealType);
          }}
          onCreateNewWithBarcode={(barcode) => {
            setIsBarcodeScannerOpen(false);
            setEditingFood({ barcode });
            setIsFoodEditorOpen(true);
          }}
        />
      )}

      {/* OCR Nutrition Label Scanner Modal */}
      {isOcrScannerOpen && (
        <OcrScannerModal
          onClose={() => setIsOcrScannerOpen(false)}
          onSaveFood={(food) => {
            saveFoodItem(food);
            refreshFoods();
            setIsOcrScannerOpen(false);
            handleOpenLogModal(food, loggingMealType);
          }}
        />
      )}

      {/* Food Editor Modal (Add/Edit Food & Custom Barcode) */}
      {isFoodEditorOpen && (
        <FoodEditorModal
          initialFood={editingFood}
          onClose={() => {
            setIsFoodEditorOpen(false);
            setEditingFood(null);
          }}
          onSave={(saved) => {
            refreshFoods();
            setIsFoodEditorOpen(false);
            setEditingFood(null);
            showToast(`Saved "${saved.name}" to database!`);
          }}
          onOpenBarcodeScanner={() => {
            setIsFoodEditorOpen(false);
            setIsBarcodeScannerOpen(true);
          }}
        />
      )}

      {/* Log Food to Meal Modal */}
      {isLogModalOpen && loggingFood && (
        <LogFoodModal
          food={loggingFood}
          initialMealType={loggingMealType}
          onClose={() => {
            setIsLogModalOpen(false);
            setLoggingFood(null);
          }}
          onConfirm={handleConfirmLog}
        />
      )}

      {/* Settings & Profile Modal */}
      {isSettingsOpen && (
        <SettingsModal
          profile={profile}
          onClose={() => setIsSettingsOpen(false)}
          onProfileUpdated={(updated) => {
            setProfile(updated);
            showToast('Settings saved!');
          }}
          onOpenDatabaseManager={() => setIsDatabaseManagerOpen(true)}
          onOpenAndroidProject={() => setIsAndroidProjectOpen(true)}
        />
      )}

      {/* Database Manager Modal */}
      {isDatabaseManagerOpen && (
        <DatabaseManagerModal
          onClose={() => setIsDatabaseManagerOpen(false)}
          onDatasetsChanged={() => {
            refreshFoods();
            showToast('Offline databases synced!');
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 inset-x-4 z-50 max-w-sm mx-auto p-3.5 rounded-2xl bg-zinc-900 text-white font-medium text-xs flex items-center gap-2.5 shadow-2xl border border-zinc-700 animate-in fade-in slide-in-from-bottom-2">
          <Utensils className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
