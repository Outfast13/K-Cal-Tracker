import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { FoodItem } from '../types/index.ts';
import { findFoodByBarcode } from '../data/storage.ts';
import {
  X,
  Camera,
  Keyboard,
  Upload,
  AlertCircle,
  Sparkles,
  Search,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

interface BarcodeScannerModalProps {
  onClose: () => void;
  onFoodFound: (food: FoodItem) => void;
  onUnregisteredBarcode: (barcode: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  onClose,
  onFoodFound,
  onUnregisteredBarcode,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [manualCode, setManualCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<{ found: boolean; food?: FoodItem; code: string } | null>(null);

  // Handle a detected barcode (from camera, manual entry, or file upload)
  const processBarcode = useCallback((barcodeRaw: string) => {
    const code = barcodeRaw.trim();
    if (!code) return;

    setDetectedCode(code);
    setIsScanning(false);

    // Stop camera video stream
    if (readerRef.current) {
      readerRef.current.reset();
    }

    const matched = findFoodByBarcode(code);
    if (matched) {
      setLookupResult({ found: true, food: matched, code });
    } else {
      setLookupResult({ found: false, code });
    }
  }, []);

  // Initialize Camera Scanner
  useEffect(() => {
    if (activeTab !== 'camera' || !isScanning) return;

    let isMounted = true;
    const codeReader = new BrowserMultiFormatReader();
    readerRef.current = codeReader;

    async function startScanner() {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (!isMounted) return;

        if (!videoInputDevices || videoInputDevices.length === 0) {
          setHasCamera(false);
          setCameraError('No camera detected on this device. You can type or paste barcodes manually below.');
          return;
        }

        // Prefer environment-facing / back camera on phones
        const backCamera = videoInputDevices.find((device) =>
          device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('environment')
        );
        const selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;

        if (videoRef.current) {
          await codeReader.decodeFromVideoDevice(
            selectedDeviceId,
            videoRef.current,
            (result, err) => {
              if (result && isMounted) {
                const text = result.getText();
                if (text) {
                  processBarcode(text);
                }
              }
            }
          );
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('Camera initialization warning:', err);
        setHasCamera(false);
        setCameraError(
          err?.message?.includes('Permission')
            ? 'Camera permission was denied. Please allow camera access or use manual barcode entry.'
            : 'Unable to stream camera feed in this environment. Use manual entry or test barcodes below.'
        );
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, [activeTab, isScanning, processBarcode]);

  // Handle Image File Upload for Barcode
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imgUrl = URL.createObjectURL(file);
    try {
      const codeReader = new BrowserMultiFormatReader();
      const result = await codeReader.decodeFromImageUrl(imgUrl);
      if (result) {
        processBarcode(result.getText());
      }
    } catch (err) {
      alert('Could not detect a barcode in this image. Ensure the barcode is clear and well lit, or type it manually.');
    } finally {
      URL.revokeObjectURL(imgUrl);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processBarcode(manualCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                Offline Barcode Scanner
              </h3>
              <p className="text-xs text-zinc-400">EAN-13, EAN-8, UPC-A, UPC-E</p>
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

        {/* Tab switch between Live Camera & Manual Code */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              setIsScanning(true);
              setLookupResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            Live Camera
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('manual');
              if (readerRef.current) readerRef.current.reset();
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual Entry
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Result Overlay when a barcode is detected */}
          {lookupResult && (
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 animate-in fade-in duration-150">
              {lookupResult.found && lookupResult.food ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                        Recognized In Offline DB!
                      </span>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {lookupResult.food.name}
                      </h4>
                      <p className="text-xs text-zinc-500">
                        {lookupResult.food.calories} kcal • P: {lookupResult.food.protein}g | C:{' '}
                        {lookupResult.food.carbohydrates}g | F: {lookupResult.food.fat}g
                      </p>
                      <p className="text-[11px] font-mono text-zinc-400 mt-1">
                        Barcode: {lookupResult.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onFoodFound(lookupResult.food!);
                        onClose();
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-sm"
                    >
                      Log to Diary
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLookupResult(null);
                        setIsScanning(true);
                      }}
                      className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-medium"
                    >
                      Scan Again
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <PlusCircle className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wide">
                        New Product Detected
                      </span>
                      <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        Barcode: <span className="font-mono text-teal-600 dark:text-teal-400">{lookupResult.code}</span>
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        This barcode is not yet registered in your offline food library. Would you like to create and associate it now?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onUnregisteredBarcode(lookupResult.code);
                        onClose();
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-sm"
                    >
                      Create &amp; Save Food
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLookupResult(null);
                        setIsScanning(true);
                      }}
                      className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Camera View */}
          {activeTab === 'camera' && !lookupResult && (
            <div className="space-y-3">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-zinc-800">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Laser scan line overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-64 h-36 border-2 border-dashed border-teal-400/80 rounded-2xl relative shadow-2xl">
                    <div className="absolute inset-x-2 top-1/2 h-0.5 bg-rose-500 shadow-sm shadow-rose-500/80 animate-pulse" />
                  </div>
                  <span className="mt-3 px-3 py-1 rounded-full bg-black/70 text-[11px] font-medium text-white tracking-wide">
                    Center barcode in frame
                  </span>
                </div>
              </div>

              {cameraError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Upload image alternative */}
              <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition">
                <Upload className="w-4 h-4 text-teal-600" />
                <span>Upload barcode image file</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Manual Input Tab */}
          {activeTab === 'manual' && !lookupResult && (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label htmlFor="manual-barcode-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Type or Paste Barcode Number
                </label>
                <div className="flex gap-2">
                  <input
                    id="manual-barcode-input"
                    type="text"
                    required
                    placeholder="e.g. 8961014111223"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Quick Interactive Test Barcodes */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Quick Barcode Presets
              </span>
              <span className="text-[10px] text-zinc-400">Tap to test offline lookup</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => processBarcode('8961014111223')}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition"
              >
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  Chicken Biryani
                </p>
                <p className="text-[10px] font-mono text-zinc-400">8961014111223 (Saved)</p>
              </button>

              <button
                type="button"
                onClick={() => processBarcode('5000159461122')}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition"
              >
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  Snickers Bar
                </p>
                <p className="text-[10px] font-mono text-zinc-400">5000159461122 (Saved)</p>
              </button>

              <button
                type="button"
                onClick={() => processBarcode('7622210449283')}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition"
              >
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  Oreo Cookies
                </p>
                <p className="text-[10px] font-mono text-zinc-400">7622210449283 (Saved)</p>
              </button>

              <button
                type="button"
                onClick={() => processBarcode('4006381333931')}
                className="p-2 rounded-xl border border-dashed border-teal-300 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20 text-left hover:border-teal-500 transition"
              >
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 truncate">
                  + New Barcode
                </p>
                <p className="text-[10px] font-mono text-teal-600/70">4006381333931 (Unsaved)</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
