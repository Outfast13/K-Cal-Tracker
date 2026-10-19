import React, { useState, useMemo } from 'react';
import {
  WeightEntry,
  ProgressPhoto,
  UserProfile,
} from '../types/index.ts';
import {
  addWeightEntry,
  deleteWeightEntry,
  getAllProgressPhotos,
  saveProgressPhoto,
  deleteProgressPhoto,
  exportWeightToCsv,
  exportDiaryToCsv,
  exportFullBackup,
} from '../data/storage.ts';
import { calculateBmi } from '../domain/fitness.ts';
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Camera,
  Download,
  CheckCircle2,
  Columns,
  Sparkles,
  Ruler,
  FileSpreadsheet,
  X,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ProgressTabProps {
  weightEntries: WeightEntry[];
  profile: UserProfile;
  onRefreshData: () => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  weightEntries,
  profile,
  onRefreshData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'weight' | 'measurements' | 'photos' | 'stats'>('weight');
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '90D' | 'ALL'>('30D');

  // Add weight modal
  const [isAddWeightOpen, setIsAddWeightOpen] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightDate, setWeightDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bodyFatInput, setBodyFatInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [hipsInput, setHipsInput] = useState('');
  const [chestInput, setChestInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  // Photos
  const [photos, setPhotos] = useState<ProgressPhoto[]>(() => getAllProgressPhotos());
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoPose, setPhotoPose] = useState<'Front' | 'Side' | 'Back'>('Front');
  const [photoDate, setPhotoDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [photoWeight, setPhotoWeight] = useState('');
  const [photoNotes, setPhotoNotes] = useState('');

  // Compare mode
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [comparePhotoAId, setComparePhotoAId] = useState<string | null>(null);
  const [comparePhotoBId, setComparePhotoBId] = useState<string | null>(null);

  // Success toast state
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Sort weight entries chronologically
  const sortedWeights = useMemo(() => {
    return [...weightEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [weightEntries]);

  const latestWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1] : null;
  const initialWeight = sortedWeights.length > 0 ? sortedWeights[0] : null;
  const previousWeight = sortedWeights.length > 1 ? sortedWeights[sortedWeights.length - 2] : null;

  const totalChangeKg =
    latestWeight && initialWeight
      ? Math.round((latestWeight.weightKg - initialWeight.weightKg) * 10) / 10
      : 0;

  const recentChangeKg =
    latestWeight && previousWeight
      ? Math.round((latestWeight.weightKg - previousWeight.weightKg) * 10) / 10
      : 0;

  const distanceToGoalKg =
    latestWeight && profile.weightTargetKg
      ? Math.round((latestWeight.weightKg - profile.weightTargetKg) * 10) / 10
      : null;

  const bmiInfo = latestWeight
    ? calculateBmi(latestWeight.weightKg, profile.currentHeightCm)
    : null;

  // Filtered weights for chart
  const chartData = useMemo(() => {
    if (sortedWeights.length === 0) return [];
    const now = new Date().getTime();
    const daysLimit =
      chartRange === '7D' ? 7 : chartRange === '30D' ? 30 : chartRange === '90D' ? 90 : 9999;
    const cutoff = now - daysLimit * 24 * 60 * 60 * 1000;

    return sortedWeights.filter((w) => new Date(w.date).getTime() >= cutoff);
  }, [sortedWeights, chartRange]);

  // Handle saving new weight
  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (isNaN(val) || val <= 0) return;

    addWeightEntry({
      weightKg: val,
      date: weightDate,
      bodyFatPercentage: bodyFatInput ? parseFloat(bodyFatInput) : undefined,
      notes: notesInput.trim() || undefined,
      measurements: {
        waistCm: waistInput ? parseFloat(waistInput) : undefined,
        hipsCm: hipsInput ? parseFloat(hipsInput) : undefined,
        chestCm: chestInput ? parseFloat(chestInput) : undefined,
      },
      source: 'MANUAL',
    });

    setIsAddWeightOpen(false);
    setWeightInput('');
    setWaistInput('');
    setHipsInput('');
    setChestInput('');
    setNotesInput('');
    onRefreshData();
    showStatus('Weight & measurements recorded!');
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save progress photo
  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl) return;

    const newPhoto: ProgressPhoto = {
      id: 'photo_' + Date.now(),
      photoUrl: photoDataUrl,
      date: photoDate,
      pose: photoPose,
      weightKg: photoWeight ? parseFloat(photoWeight) : (latestWeight?.weightKg || undefined),
      notes: photoNotes.trim() || undefined,
      timestamp: Date.now(),
    };

    saveProgressPhoto(newPhoto);
    const updated = getAllProgressPhotos();
    setPhotos(updated);
    setIsAddPhotoOpen(false);
    setPhotoDataUrl(null);
    setPhotoNotes('');
    showStatus('Progress photo saved!');
  };

  // Delete photo
  const handleDeletePhoto = (id: string) => {
    deleteProgressPhoto(id);
    setPhotos(getAllProgressPhotos());
    showStatus('Photo deleted');
  };

  // Download CSV
  const handleDownloadCsv = (type: 'weight' | 'diary' | 'backup') => {
    let content = '';
    let filename = '';
    let mime = 'text/csv';

    if (type === 'weight') {
      content = exportWeightToCsv();
      filename = `weight_history_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'diary') {
      content = exportDiaryToCsv();
      filename = `calorie_diary_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      content = JSON.stringify(exportFullBackup(), null, 2);
      filename = `kcaltracker_backup_${new Date().toISOString().split('T')[0]}.json`;
      mime = 'application/json';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showStatus(`Exported ${filename}!`);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Toast Alert */}
      {statusMsg && (
        <div className="fixed top-16 inset-x-4 z-50 max-w-sm mx-auto p-3 rounded-2xl bg-teal-600 text-white font-medium text-xs flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Header Cards: Current Weight & Goal */}
      <div className="p-5 rounded-3xl bg-linear-to-br from-teal-800 via-teal-900 to-zinc-950 text-white shadow-xl shadow-teal-950/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-teal-700/60 border border-teal-500/30 text-teal-200">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-teal-200">
                Weight &amp; Body Progress
              </h2>
              <p className="text-xs text-teal-300/80">
                Height: {profile.currentHeightCm} cm • Goal: {profile.weightTargetKg || '—'} kg
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setWeightInput(latestWeight ? latestWeight.weightKg.toString() : '');
              setIsAddWeightOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Log Weight
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center py-2 bg-teal-950/40 rounded-2xl border border-teal-700/30">
          <div>
            <p className="text-[10px] uppercase font-bold text-teal-300">Current</p>
            <p className="text-base sm:text-lg font-black text-white mt-0.5">
              {latestWeight ? `${latestWeight.weightKg} kg` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-teal-300">Total Lost</p>
            <p
              className={`text-base sm:text-lg font-black mt-0.5 flex items-center justify-center gap-0.5 ${
                totalChangeKg < 0 ? 'text-emerald-300' : totalChangeKg > 0 ? 'text-amber-300' : 'text-zinc-300'
              }`}
            >
              {totalChangeKg < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              {Math.abs(totalChangeKg)} kg
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-teal-300">To Goal</p>
            <p className="text-base sm:text-lg font-black text-amber-300 mt-0.5">
              {distanceToGoalKg !== null ? `${distanceToGoalKg > 0 ? '-' : '+'}${Math.abs(distanceToGoalKg)} kg` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-teal-300">BMI</p>
            <p className="text-base sm:text-lg font-black text-emerald-300 mt-0.5">
              {bmiInfo ? bmiInfo.bmi : '—'}
            </p>
          </div>
        </div>

        {/* BMI status pill */}
        {bmiInfo && (
          <div className="mt-3 flex items-center justify-between text-xs px-2 pt-2 border-t border-teal-800/60">
            <span className="text-teal-200">
              BMI Status: <strong className="text-white">{bmiInfo.category}</strong>
            </span>
            <span className="text-[11px] text-teal-300">
              Normal range: 18.5 – 24.9
            </span>
          </div>
        )}
      </div>

      {/* Sub-tab navigation */}
      <div className="flex rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80 p-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveSubTab('weight')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeSubTab === 'weight'
              ? 'bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          Weight Chart
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('measurements')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeSubTab === 'measurements'
              ? 'bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          Measurements
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('photos')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeSubTab === 'photos'
              ? 'bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          Photos ({photos.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('stats')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeSubTab === 'stats'
              ? 'bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          Exports
        </button>
      </div>

      {/* SUB-TAB 1: WEIGHT CHART & LOG HISTORY */}
      {activeSubTab === 'weight' && (
        <div className="space-y-4">
          {/* Interactive Chart Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Weight Trend
                </h3>
                <p className="text-xs text-zinc-400">
                  Showing {chartData.length} records
                </p>
              </div>

              {/* Time Range Pills */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
                {(['7D', '30D', '90D', 'ALL'] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setChartRange(range)}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      chartRange === range
                        ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-300 shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Visual Trend Graph */}
            {chartData.length > 1 ? (
              <div className="h-44 w-full relative pt-2">
                {(() => {
                  const weights = chartData.map((d) => d.weightKg);
                  const minW = Math.floor(Math.min(...weights) - 1);
                  const maxW = Math.ceil(Math.max(...weights) + 1);
                  const range = maxW - minW || 1;

                  const points = chartData.map((d, idx) => {
                    const x = (idx / (chartData.length - 1)) * 100;
                    const y = 100 - ((d.weightKg - minW) / range) * 80 - 10;
                    return { x, y, weight: d.weightKg, date: d.date };
                  });

                  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                  const fillD = `${pathD} L 100 100 L 0 100 Z`;

                  return (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Reference line for target weight */}
                      {profile.weightTargetKg && profile.weightTargetKg >= minW && profile.weightTargetKg <= maxW && (
                        <line
                          x1="0"
                          y1={100 - ((profile.weightTargetKg - minW) / range) * 80 - 10}
                          x2="100"
                          y2={100 - ((profile.weightTargetKg - minW) / range) * 80 - 10}
                          stroke="#10b981"
                          strokeDasharray="2,2"
                          strokeWidth="0.8"
                        />
                      )}

                      {/* Area Fill */}
                      <path d={fillD} fill="url(#weightGrad)" />

                      {/* Line Stroke */}
                      <path d={pathD} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Data Point Dots */}
                      {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="2.2" className="fill-teal-600 dark:fill-teal-400 stroke-white dark:stroke-zinc-900 stroke-1" />
                      ))}
                    </svg>
                  );
                })()}

                <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-2 px-1">
                  <span>{chartData[0].date}</span>
                  <span className="font-semibold text-teal-600">Goal: {profile.weightTargetKg}kg</span>
                  <span>{chartData[chartData.length - 1].date}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-400">
                Log at least two weight entries to view graph trend line.
              </div>
            )}
          </div>

          {/* Weight Log History */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Weight History
            </h4>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {[...sortedWeights].reverse().map((entry) => (
                <div key={entry.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {entry.weightKg} kg
                      </span>
                      {entry.bodyFatPercentage && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold">
                          {entry.bodyFatPercentage}% BF
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-400">
                        {entry.source === 'HEALTH_CONNECT' ? 'Health Connect' : 'Manual'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> {entry.date}
                      {entry.notes && <span>• {entry.notes}</span>}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      deleteWeightEntry(entry.id);
                      onRefreshData();
                      showStatus('Entry deleted');
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg transition"
                    title="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BODY MEASUREMENTS */}
      {activeSubTab === 'measurements' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Body Measurements
                </h4>
                <p className="text-xs text-zinc-400">
                  Circumference metrics track fat loss better than the scale alone
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddWeightOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Log Tape Measure
              </button>
            </div>

            {/* Latest Measurements Grid */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Waist</span>
                <p className="text-base font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {latestWeight?.measurements?.waistCm ? `${latestWeight.measurements.waistCm} cm` : '—'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Hips</span>
                <p className="text-base font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {latestWeight?.measurements?.hipsCm ? `${latestWeight.measurements.hipsCm} cm` : '—'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Chest</span>
                <p className="text-base font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {latestWeight?.measurements?.chestCm ? `${latestWeight.measurements.chestCm} cm` : '—'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Tip: Measure at the narrowest point of your waist and widest point of your hips once weekly for reliable body composition trends.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PROGRESS PHOTOS & SIDE-BY-SIDE COMPARISON */}
      {activeSubTab === 'photos' && (
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsCompareMode(!isCompareMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isCompareMode
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> {isCompareMode ? 'Exit Comparison' : 'Compare Side-by-Side'}
            </button>

            <button
              type="button"
              onClick={() => setIsAddPhotoOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Camera className="w-3.5 h-3.5" /> Add Progress Photo
            </button>
          </div>

          {/* Compare Mode View */}
          {isCompareMode && (
            <div className="p-5 rounded-3xl bg-zinc-900 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-teal-400">
                    Visual Transformation Comparison
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Select any two photos below to inspect differences side-by-side
                  </p>
                </div>
              </div>

              {photos.length >= 2 ? (
                <div className="grid grid-cols-2 gap-3">
                  {/* Photo A */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Photo A (Before)</label>
                    <select
                      value={comparePhotoAId || photos[photos.length - 1]?.id}
                      onChange={(e) => setComparePhotoAId(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white"
                    >
                      {photos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.date} • {p.pose} • {p.weightKg ? `${p.weightKg}kg` : ''}
                        </option>
                      ))}
                    </select>

                    {(() => {
                      const pA = photos.find((p) => p.id === (comparePhotoAId || photos[photos.length - 1]?.id));
                      return pA ? (
                        <div className="rounded-2xl overflow-hidden aspect-3/4 bg-zinc-800 relative">
                          <img src={pA.photoUrl} alt="Before" className="w-full h-full object-cover" />
                          <div className="absolute bottom-2 left-2 right-2 p-1.5 bg-black/70 backdrop-blur-xs rounded-xl text-[10px] text-white">
                            <p className="font-bold">{pA.date}</p>
                            <p className="text-zinc-300">{pA.weightKg} kg • {pA.pose}</p>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Photo B */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Photo B (After)</label>
                    <select
                      value={comparePhotoBId || photos[0]?.id}
                      onChange={(e) => setComparePhotoBId(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white"
                    >
                      {photos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.date} • {p.pose} • {p.weightKg ? `${p.weightKg}kg` : ''}
                        </option>
                      ))}
                    </select>

                    {(() => {
                      const pB = photos.find((p) => p.id === (comparePhotoBId || photos[0]?.id));
                      return pB ? (
                        <div className="rounded-2xl overflow-hidden aspect-3/4 bg-zinc-800 relative">
                          <img src={pB.photoUrl} alt="After" className="w-full h-full object-cover" />
                          <div className="absolute bottom-2 left-2 right-2 p-1.5 bg-black/70 backdrop-blur-xs rounded-xl text-[10px] text-white">
                            <p className="font-bold">{pB.date}</p>
                            <p className="text-zinc-300">{pB.weightKg} kg • {pB.pose}</p>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-zinc-400">
                  Please upload at least 2 progress photos to use the comparison view.
                </div>
              )}
            </div>
          )}

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs relative group"
              >
                <div className="aspect-3/4 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                  <img
                    src={photo.photoUrl}
                    alt={`Progress ${photo.date}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                      {photo.pose}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition backdrop-blur-xs opacity-0 group-hover:opacity-100"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {photo.weightKg ? `${photo.weightKg} kg` : '—'}
                    </span>
                    <span className="text-[10px] text-zinc-400">{photo.date}</span>
                  </div>
                  {photo.notes && (
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">{photo.notes}</p>
                  )}
                </div>
              </div>
            ))}

            {photos.length === 0 && (
              <div className="col-span-full p-8 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 space-y-2">
                <Camera className="w-8 h-8 mx-auto text-zinc-400" />
                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                  No progress photos stored yet
                </p>
                <p className="text-[11px] text-zinc-400">
                  Snap or upload photos privately on your device. Zero cloud sync.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: HISTORICAL STATS & EXPORTS */}
      {activeSubTab === 'stats' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Export Historical Fitness &amp; Nutrition Data
            </h4>
            <p className="text-xs text-zinc-400">
              Export your data anytime into universal CSV or JSON formats for analysis in Excel, Google Sheets, or backup restoration.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleDownloadCsv('diary')}
                className="w-full p-3.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Food Diary Log History (CSV)
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Dates, meals, calories, protein, carbs, fat, and fiber
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => handleDownloadCsv('weight')}
                className="w-full p-3.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Weight &amp; Measurements History (CSV)
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Daily weights, waist/hips/chest tape measurements
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => handleDownloadCsv('backup')}
                className="w-full p-3.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Complete All-in-One Database Backup (JSON)
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      All foods, custom barcodes, diary logs, exercises, and photos
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG WEIGHT & MEASUREMENTS */}
      {isAddWeightOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                  Record Weight
                </h4>
                <p className="text-xs text-zinc-400">Track changes and body composition</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddWeightOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWeight} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-zinc-500">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="e.g. 74.5"
                  className="w-full mt-1 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-base font-bold"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-500">Date</label>
                  <input
                    type="date"
                    value={weightDate}
                    onChange={(e) => setWeightDate(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-500">Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFatInput}
                    onChange={(e) => setBodyFatInput(e.target.value)}
                    placeholder="Optional"
                    className="w-full mt-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Tape measurements */}
              <div>
                <label className="text-[11px] font-bold uppercase text-zinc-500">Tape Measurements (cm)</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <input
                    type="number"
                    step="0.5"
                    value={waistInput}
                    onChange={(e) => setWaistInput(e.target.value)}
                    placeholder="Waist"
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={hipsInput}
                    onChange={(e) => setHipsInput(e.target.value)}
                    placeholder="Hips"
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={chestInput}
                    onChange={(e) => setChestInput(e.target.value)}
                    placeholder="Chest"
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-zinc-500">Notes</label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Morning weigh-in, post workout..."
                  className="w-full mt-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/30 transition mt-2"
              >
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROGRESS PHOTO */}
      {isAddPhotoOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                  Upload Progress Photo
                </h4>
                <p className="text-xs text-zinc-400">Stored 100% locally on device</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPhotoOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-zinc-500">Choose Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handlePhotoUpload}
                  className="w-full mt-1 text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 dark:file:bg-teal-950/60 dark:file:text-teal-300"
                />
              </div>

              {photoDataUrl && (
                <div className="w-28 h-36 mx-auto rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-xs">
                  <img src={photoDataUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-500">Pose</label>
                  <select
                    value={photoPose}
                    onChange={(e) => setPhotoPose(e.target.value as any)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="Front">Front</option>
                    <option value="Side">Side</option>
                    <option value="Back">Back</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-500">Date</label>
                  <input
                    type="date"
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-zinc-500">Weight at time (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={photoWeight}
                  onChange={(e) => setPhotoWeight(e.target.value)}
                  placeholder={latestWeight ? `${latestWeight.weightKg}` : 'e.g. 74.0'}
                  className="w-full mt-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-zinc-500">Notes</label>
                <input
                  type="text"
                  value={photoNotes}
                  onChange={(e) => setPhotoNotes(e.target.value)}
                  placeholder="Week 4, start of cut..."
                  className="w-full mt-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <button
                type="submit"
                disabled={!photoDataUrl}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-teal-600/30 transition mt-2"
              >
                Save Photo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
