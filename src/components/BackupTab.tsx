import React, { useState } from 'react';
import { exportFullBackup, restoreFullBackup, resetToInitialDatabase } from '../data/storage.ts';
import {
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  FileJson,
} from 'lucide-react';

interface BackupTabProps {
  onDatabaseChanged: () => void;
}

export const BackupTab: React.FC<BackupTabProps> = ({ onDatabaseChanged }) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  const handleExportJson = () => {
    try {
      const backup = exportFullBackup();
      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.href = url;
      a.download = `kcaltracker_backup_${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage(`Successfully exported ${backup.foods.length} foods and ${backup.diaryEntries.length} diary entries to JSON.`);
      setIsError(false);
    } catch (err: any) {
      setStatusMessage('Export failed: ' + (err?.message || 'Unknown error'));
      setIsError(true);
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = restoreFullBackup(content);
      if (res.success) {
        setStatusMessage(`Successfully restored ${res.count} records into your offline database!`);
        setIsError(false);
        onDatabaseChanged();
      } else {
        setStatusMessage('Restore failed: ' + (res.error || 'Invalid backup structure'));
        setIsError(true);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset your offline database to the default Pakistani & international foods? Any custom modifications will be cleared.')) {
      resetToInitialDatabase();
      setStatusMessage('Reset completed! Initial food library restored.');
      setIsError(false);
      onDatabaseChanged();
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Data Ownership Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              100% Offline Data Ownership
            </h3>
            <p className="text-xs text-zinc-400">
              Zero cloud tracking • No accounts required • Pure local storage
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          All your logged meals, custom barcode associations, OCR-scanned foods, and nutritional goals reside exclusively in your local device storage. You can backup your entire data at any time or transfer it between devices using a standard JSON file.
        </p>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in ${
              isError
                ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {isError ? (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Actions Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-teal-600" /> Backup &amp; Restore
        </h4>

        <div className="space-y-3">
          {/* Export button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 gap-3">
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Export Database to JSON
              </p>
              <p className="text-[11px] text-zinc-400">
                Saves foods, custom barcodes, diary logs, and targets
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportJson}
              className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition shrink-0"
            >
              <Download className="w-4 h-4" />
              Download Backup
            </button>
          </div>

          {/* Import file */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 gap-3">
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Restore Database from JSON
              </p>
              <p className="text-[11px] text-zinc-400">
                Restores complete database snapshot without creating an account
              </p>
            </div>
            <label className="py-2 px-4 rounded-xl border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shrink-0">
              <Upload className="w-4 h-4 text-teal-600" />
              Select Backup File
              <input type="file" accept=".json,application/json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>

          {/* Reset button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 gap-3">
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Reset to Default Pakistani &amp; World Database
              </p>
              <p className="text-[11px] text-zinc-400">
                Re-seeds initial Pakistani recipes and sample barcode items
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="py-2 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-xs flex items-center justify-center gap-1.5 transition shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Database
            </button>
          </div>
        </div>
      </div>

      {/* Android Storage Access Framework Note */}
      <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
        <h5 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
          <FileJson className="w-4 h-4 text-teal-600" /> Android Storage Access Framework (SAF) Compliance
        </h5>
        <p>
          On native Android devices, the exported JSON file directly leverages the Storage Access Framework (SAF), allowing you to save the file into your Downloads folder, Google Drive, SD card, or USB OTG drive without granting invasive file system permissions.
        </p>
        <p className="text-[11px] text-zinc-400">
          Tip: Always make a backup before uninstalling the application or factory resetting your device!
        </p>
      </div>
    </div>
  );
};
