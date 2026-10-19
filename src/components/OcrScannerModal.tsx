import React, { useRef, useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { parseNutritionLabel, ParsedNutritionLabel } from '../domain/labelParser.ts';
import { FoodItem } from '../types/index.ts';
import {
  X,
  Camera,
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCw,
} from 'lucide-react';

interface OcrScannerModalProps {
  onClose: () => void;
  onAcceptData: (extractedFood: Partial<FoodItem>) => void;
}

export const OcrScannerModal: React.FC<OcrScannerModalProps> = ({
  onClose,
  onAcceptData,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedNutritionLabel | null>(null);
  const [rawOcrText, setRawOcrText] = useState<string>('');

  // Editable extracted values
  const [foodName, setFoodName] = useState<string>('');
  const [calories, setCalories] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fat, setFat] = useState<string>('');
  const [fiber, setFiber] = useState<string>('');
  const [sugars, setSugars] = useState<string>('');
  const [sodium, setSodium] = useState<string>('');
  const [servingSize, setServingSize] = useState<string>('');
  const [servingUnit, setServingUnit] = useState<string>('g');
  const [isPer100g, setIsPer100g] = useState<boolean>(false);

  // Initialize camera
  useEffect(() => {
    let isMounted = true;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (!isMounted) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        if (!isMounted) return;
        setHasCamera(false);
        setCameraError('Camera access unavailable. Use photo upload or sample label presets.');
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Update form inputs when parser produces results
  const applyParsedResults = (parsed: ParsedNutritionLabel) => {
    setParsedData(parsed);
    setCalories(parsed.calories?.toString() ?? '');
    setProtein(parsed.protein?.toString() ?? '');
    setCarbs(parsed.carbohydrates?.toString() ?? '');
    setFat(parsed.fat?.toString() ?? '');
    setFiber(parsed.fiber?.toString() ?? '');
    setSugars(parsed.sugars?.toString() ?? '');
    setSodium(parsed.sodium?.toString() ?? '');
    setServingSize(parsed.servingSize?.toString() ?? (parsed.isPer100g ? '100' : '1'));
    setServingUnit(parsed.servingUnit || 'g');
    setIsPer100g(parsed.isPer100g);
  };

  // Run Tesseract OCR on image data URL
  const runOcrOnImage = async (imageSrc: string) => {
    setIsProcessing(true);
    setOcrProgress('Initializing on-device OCR engine...');
    try {
      const worker = await createWorker('eng');
      setOcrProgress('Extracting text blocks from label...');
      const ret = await worker.recognize(imageSrc);
      const text = ret.data.text;
      setRawOcrText(text);
      await worker.terminate();

      setOcrProgress('Parsing nutritional facts...');
      const parsed = parseNutritionLabel(text);
      applyParsedResults(parsed);
    } catch (err: any) {
      console.error('OCR failure:', err);
      alert('OCR could not process image. You can test with our sample nutrition facts below.');
    } finally {
      setIsProcessing(false);
      setOcrProgress('');
    }
  };

  // Take Snapshot from camera stream
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);

    // Stop video tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    runOcrOnImage(dataUrl);
  };

  // Upload image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);
      runOcrOnImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Sample real labels for instant offline verification
  const loadSampleLabel = (type: 'us' | 'eu' | 'pak') => {
    let sampleText = '';
    if (type === 'us') {
      sampleText = `
Nutrition Facts
Serving Size 55g
Calories 230
Total Fat 8g
Saturated Fat 1g
Sodium 160mg
Total Carbohydrate 37g
Dietary Fiber 4g
Total Sugars 12g
Protein 3g
      `;
      setFoodName('Granola Snack Cluster');
    } else if (type === 'eu') {
      sampleText = `
NUTRITION INFORMATION
Values per 100g:
Energy 440 kcal
Fat 16.5g
Carbohydrate 64.0g
Sugars 22.0g
Protein 7.8g
Salt 0.85g
      `;
      setFoodName('Wholemeal Digestive Biscuit');
    } else {
      sampleText = `
Nutrition Facts
Per 100g Serving
Energy 290 kcal
Total Fat 14.0g
Total Carbohydrates 38.0g
Dietary Fibre 3.5g
Protein 6.5g
Sodium 420mg
      `;
      setFoodName('Spiced Paratha Wrap');
    }

    setRawOcrText(sampleText);
    const parsed = parseNutritionLabel(sampleText);
    applyParsedResults(parsed);
  };

  // Confirm and return data to parent
  const handleConfirm = () => {
    const cal = parseFloat(calories) || 0;
    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fat) || 0;

    const partialFood: Partial<FoodItem> = {
      name: foodName.trim() || 'Scanned Packaged Food',
      basis: isPer100g ? '100G' : 'SERVING',
      servingSize: parseFloat(servingSize) || (isPer100g ? 100 : 1),
      servingUnit: servingUnit.trim() || 'g',
      calories: Math.round(cal * 10) / 10,
      protein: Math.round(p * 10) / 10,
      carbohydrates: Math.round(c * 10) / 10,
      fat: Math.round(f * 10) / 10,
      fiber: fiber ? Math.round(parseFloat(fiber) * 10) / 10 : 0,
      sugars: sugars ? Math.round(parseFloat(sugars) * 10) / 10 : 0,
      sodium: sodium ? Math.round(parseFloat(sodium)) : 0,
    };

    onAcceptData(partialFood);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg my-4 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                On-Device Nutrition Label OCR
              </h3>
              <p className="text-xs text-zinc-400">Extracts macros offline from packaging</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera View or Captured Photo */}
          {!capturedImage && (
            <div className="space-y-3">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-zinc-800">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted
                />
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  <div className="w-full h-full border-2 border-dashed border-teal-400/70 rounded-2xl flex items-end justify-center pb-3">
                    <span className="px-3 py-1 rounded-full bg-black/70 text-xs text-white">
                      Align Nutrition Facts panel
                    </span>
                  </div>
                </div>
              </div>

              {cameraError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>
                <label className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-1.5 transition">
                  <Upload className="w-4 h-4 text-teal-600" />
                  Upload
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="p-6 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/60 flex flex-col items-center justify-center text-center space-y-2">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{ocrProgress}</p>
              <p className="text-xs text-zinc-400">Processing locally on device CPU</p>
            </div>
          )}

          {/* Extracted Values Editable Form */}
          {parsedData && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Extracted Nutritional Values
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 font-medium text-zinc-700 dark:text-zinc-300">
                  {isPer100g ? 'Detected per 100g' : 'Detected per serving'}
                </span>
              </div>

              <div>
                <label htmlFor="ocr-food-name" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Product / Food Name
                </label>
                <input
                  id="ocr-food-name"
                  type="text"
                  placeholder="e.g. Oats Cereal, Biscuits..."
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold"
                />
              </div>

              {/* Basis selector */}
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsPer100g(false)}
                  className={`flex-1 py-1.5 px-2 rounded-lg border transition ${
                    !isPer100g ? 'bg-teal-600 text-white border-teal-600 font-semibold' : 'border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  Per Serving
                </button>
                <button
                  type="button"
                  onClick={() => setIsPer100g(true)}
                  className={`flex-1 py-1.5 px-2 rounded-lg border transition ${
                    isPer100g ? 'bg-teal-600 text-white border-teal-600 font-semibold' : 'border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  Per 100g / 100ml
                </button>
              </div>

              {/* Calories & Macros Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="ocr-calories" className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    id="ocr-calories"
                    type="number"
                    step="any"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold"
                  />
                </div>
                <div>
                  <label htmlFor="ocr-serving-size" className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Serving Size ({servingUnit})
                  </label>
                  <input
                    id="ocr-serving-size"
                    type="number"
                    step="any"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="ocr-protein" className="block text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                    Protein (g)
                  </label>
                  <input
                    id="ocr-protein"
                    type="number"
                    step="any"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label htmlFor="ocr-carbs" className="block text-[11px] font-medium text-blue-600 dark:text-blue-400 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    id="ocr-carbs"
                    type="number"
                    step="any"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label htmlFor="ocr-fat" className="block text-[11px] font-medium text-amber-600 dark:text-amber-400 mb-1">
                    Fat (g)
                  </label>
                  <input
                    id="ocr-fat"
                    type="number"
                    step="any"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="ocr-fiber" className="block text-[10px] text-zinc-500 mb-1">Fiber (g)</label>
                  <input
                    id="ocr-fiber"
                    type="number"
                    step="any"
                    value={fiber}
                    onChange={(e) => setFiber(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="ocr-sugars" className="block text-[10px] text-zinc-500 mb-1">Sugars (g)</label>
                  <input
                    id="ocr-sugars"
                    type="number"
                    step="any"
                    value={sugars}
                    onChange={(e) => setSugars(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="ocr-sodium" className="block text-[10px] text-zinc-500 mb-1">Sodium (mg)</label>
                  <input
                    id="ocr-sodium"
                    type="number"
                    step="any"
                    value={sodium}
                    onChange={(e) => setSodium(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCapturedImage(null);
                    setParsedData(null);
                  }}
                  className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-medium flex items-center gap-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Retake
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition"
                >
                  Use Extracted Nutrition
                </button>
              </div>
            </div>
          )}

          {/* Presets & Demo Labels for Instant Offline Testing */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-600" /> Instant Sample Nutrition Labels
              </span>
              <span className="text-[10px] text-zinc-400">Test parser directly</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => loadSampleLabel('us')}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition"
              >
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  US Panel
                </p>
                <p className="text-[10px] text-zinc-400">230 kcal / 55g</p>
              </button>
              <button
                type="button"
                onClick={() => loadSampleLabel('eu')}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition"
              >
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  European 100g
                </p>
                <p className="text-[10px] text-zinc-400">440 kcal / 100g</p>
              </button>
              <button
                type="button"
                onClick={() => loadSampleLabel('pak')}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition"
              >
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  Paratha Wrap
                </p>
                <p className="text-[10px] text-zinc-400">290 kcal / 100g</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
