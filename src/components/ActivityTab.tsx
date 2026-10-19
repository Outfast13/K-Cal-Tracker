import React, { useState } from 'react';
import { ExerciseEntry, UserProfile } from '../types/index.ts';
import {
  addExerciseEntry,
  deleteExerciseEntry,
  saveUserProfile,
} from '../data/storage.ts';
import { calculateExerciseCalories, ACTIVITY_MET_TABLE } from '../domain/fitness.ts';
import {
  Footprints,
  Dumbbell,
  Plus,
  Activity,
  Heart,
  Flame,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Layers,
  X,
} from 'lucide-react';

interface ActivityTabProps {
  currentDate: string;
  exerciseEntries: ExerciseEntry[];
  profile: UserProfile;
  onRefreshData: () => void;
}

export const ActivityTab: React.FC<ActivityTabProps> = ({
  currentDate,
  exerciseEntries,
  profile,
  onRefreshData,
}) => {
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState('Outdoor Run');
  const [category, setCategory] = useState<'Walking' | 'Running' | 'Cycling' | 'Swimming' | 'Strength' | 'Cardio' | 'Sports' | 'Mobility'>('Running');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [distanceKm, setDistanceKm] = useState('4.2');
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'vigorous'>('moderate');
  const [setsRepsCount, setSetsRepsCount] = useState('3');
  const [repsCount, setRepsCount] = useState('10');
  const [weightLifted, setWeightLifted] = useState('50');

  // Health Connect integration toggle
  const [healthConnectStatus, setHealthConnectStatus] = useState(profile.healthConnectConnected);
  const [showHealthConnectInfo, setShowHealthConnectInfo] = useState(false);

  const totalBurnedCalories = exerciseEntries.reduce((s, e) => s + e.estimatedCalories, 0);
  const totalDurationMinutes = exerciseEntries.reduce((s, e) => s + e.durationMinutes, 0);

  const categories = [
    { key: 'Walking', label: 'Walking' },
    { key: 'Running', label: 'Running' },
    { key: 'Cycling', label: 'Cycling' },
    { key: 'Swimming', label: 'Swimming' },
    { key: 'Strength', label: 'Strength' },
    { key: 'Cardio', label: 'Cardio' },
    { key: 'Sports', label: 'Sports' },
    { key: 'Mobility', label: 'Mobility & Stretching' },
  ];

  const handleToggleHealthConnect = () => {
    const updated = !healthConnectStatus;
    setHealthConnectStatus(updated);
    saveUserProfile({ ...profile, healthConnectConnected: updated });
    onRefreshData();
  };

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseFloat(durationMinutes) || 0;
    if (duration <= 0) return;

    const estCalories = calculateExerciseCalories(
      category.toLowerCase(),
      intensity,
      duration,
      70 // baseline user weight
    );

    const setsData =
      category === 'Strength'
        ? [
            {
              sets: parseInt(setsRepsCount) || 3,
              reps: parseInt(repsCount) || 10,
              weightKg: parseFloat(weightLifted) || 0,
            },
          ]
        : undefined;

    addExerciseEntry({
      name: exerciseName.trim() || category,
      category,
      durationMinutes: duration,
      distanceKm: distanceKm ? parseFloat(distanceKm) : undefined,
      intensity,
      estimatedCalories: estCalories,
      setsReps: setsData,
      date: currentDate,
      source: 'MANUAL',
    });

    setIsAddExerciseModalOpen(false);
    onRefreshData();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Health Connect Status Banner */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-teal-800 to-emerald-950 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-teal-300">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Android Health Connect
              </h3>
              <p className="text-xs text-teal-200/80">
                {healthConnectStatus ? 'Connected • Syncing steps & active energy' : 'Disconnected • Offline manual logging only'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleHealthConnect}
            className={`py-1.5 px-3 rounded-full text-xs font-bold transition ${
              healthConnectStatus
                ? 'bg-emerald-400 text-emerald-950'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {healthConnectStatus ? 'Connected' : 'Connect'}
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Sync steps, walking distance, workouts, and energy burned seamlessly with Google Fit, Samsung Health, Garmin, and Fitbit via Android's native Health Connect API.
        </p>

        <button
          type="button"
          onClick={() => setShowHealthConnectInfo(!showHealthConnectInfo)}
          className="text-xs text-teal-200 hover:text-white flex items-center gap-1 font-semibold"
        >
          <Shield className="w-3.5 h-3.5" />
          {showHealthConnectInfo ? 'Hide permissions detail' : 'View permissions & privacy guarantees'}
        </button>

        {showHealthConnectInfo && (
          <div className="p-3.5 rounded-2xl bg-black/40 text-xs text-zinc-300 space-y-2 animate-in fade-in">
            <p className="font-semibold text-white">Requested Health Permissions:</p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-300">
              <li>Read &amp; Write Steps: Calculates daily step goal progress.</li>
              <li>Read Exercise Sessions: Imports running, cycling, and walking workouts without duplication.</li>
              <li>Read Active Calories: Combines burned calories with your daily budget.</li>
              <li>Read Weight: Automatically updates historical progress.</li>
            </ul>
            <p className="text-[10px] text-emerald-300 pt-1">
              Guaranteed 100% private: Health Connect data remains strictly local to your device and is never uploaded to external servers.
            </p>
          </div>
        )}
      </div>

      {/* Daily Activity Stats Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Exercise &amp; Calories Burned
              </h4>
              <p className="text-xs text-zinc-400">Daily physical exertion</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddExerciseModalOpen(true)}
            className="py-1.5 px-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" /> Log Workout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Burned</p>
            <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {Math.round(totalBurnedCalories)} <span className="text-xs font-normal text-zinc-400">kcal</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Active Time</p>
            <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              {totalDurationMinutes} <span className="text-xs font-normal text-zinc-400">mins</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Sessions</p>
            <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              {exerciseEntries.length}
            </p>
          </div>
        </div>

        {/* Exercise Items List */}
        <div className="space-y-2 pt-1">
          {exerciseEntries.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-400">
              No exercise recorded for today. Tap "Log Workout" above to record a workout.
            </div>
          ) : (
            exerciseEntries.map((ex) => (
              <div
                key={ex.id}
                className="p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100/70 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {ex.name}
                    </h5>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {ex.category} • {ex.durationMinutes} mins
                      {ex.distanceKm ? ` • ${ex.distanceKm} km` : ''}
                      {ex.intensity ? ` • ${ex.intensity}` : ''}
                    </p>
                    {ex.setsReps && ex.setsReps[0] && (
                      <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5">
                        {ex.setsReps[0].sets} sets × {ex.setsReps[0].reps} reps ({ex.setsReps[0].weightKg} kg)
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    +{ex.estimatedCalories} kcal
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      deleteExerciseEntry(ex.id);
                      onRefreshData();
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg"
                    title="Delete workout"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Exercise Modal */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md my-6 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-teal-600" /> Log Workout / Activity
              </h4>
              <button
                type="button"
                onClick={() => setIsAddExerciseModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExercise} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Workout Category
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {categories.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setCategory(c.key as any);
                        setExerciseName(c.label);
                      }}
                      className={`py-1.5 px-1 text-[11px] rounded-xl font-medium border text-center transition ${
                        category === c.key
                          ? 'bg-teal-600 text-white border-teal-600 font-semibold'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {c.key}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Activity Name
                </label>
                <input
                  type="text"
                  required
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="600"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Distance (km, optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  />
                </div>
              </div>

              {category === 'Strength' && (
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    Strength Training Details
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-500">Sets</label>
                      <input
                        type="number"
                        value={setsRepsCount}
                        onChange={(e) => setSetsRepsCount(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">Reps</label>
                      <input
                        type="number"
                        value={repsCount}
                        onChange={(e) => setRepsCount(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">Weight (kg)</label>
                      <input
                        type="number"
                        value={weightLifted}
                        onChange={(e) => setWeightLifted(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Intensity */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Exertion Intensity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'moderate', 'vigorous'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setIntensity(lvl)}
                      className={`py-1.5 text-xs rounded-xl font-medium border capitalize ${
                        intensity === lvl
                          ? 'bg-amber-600 text-white border-amber-600 font-bold'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExerciseModalOpen(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  Save Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
