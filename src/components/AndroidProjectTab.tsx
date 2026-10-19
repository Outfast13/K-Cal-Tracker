import React, { useState } from 'react';
import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES, AndroidFileRecord } from '../data/androidProjectFiles.ts';
import {
  Download,
  FileCode2,
  FolderTree,
  Copy,
  Check,
  Terminal,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

export const AndroidProjectTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFileRecord>(ANDROID_PROJECT_FILES[9]); // MainActivity.kt
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add each file to the zip
      ANDROID_PROJECT_FILES.forEach((f) => {
        zip.file(f.path, f.content);
      });

      // Generate zip
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'OfflineCalorieTracker_AndroidStudio_Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed generating zip:', e);
      alert('Failed generating zip. You can copy the code directly from the viewer.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-teal-800 to-zinc-900 text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-300">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Complete Native Android Studio Project
              </h3>
              <p className="text-xs text-teal-200/80">
                Kotlin • Jetpack Compose (Material 3) • Room DB • CameraX • ML Kit
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition shrink-0 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isZipping ? 'Packaging ZIP...' : 'Download Project (.zip)'}
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          This contains the complete, buildable native Android project source code. You can download the full project zip, extract it, and immediately open it in Android Studio to assemble an APK.
        </p>

        {/* Build instructions quick card */}
        <div className="p-3 rounded-2xl bg-black/40 border border-teal-500/20 font-mono text-[11px] text-teal-300 flex items-center justify-between">
          <span>./gradlew assembleDebug &amp;&amp; adb install app/build/outputs/apk/debug/app-debug.apk</span>
          <span className="text-[10px] text-zinc-400 font-sans hidden sm:inline">Build &amp; Install command</span>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
        {/* File Tree Selector */}
        <div className="md:col-span-4 p-3 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-h-[500px] overflow-y-auto space-y-1">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-teal-600" /> Source Files ({ANDROID_PROJECT_FILES.length})
          </p>

          <div className="space-y-0.5">
            {ANDROID_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              const fileName = file.path.split('/').pop() || file.path;
              const dirName = file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : '';

              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl transition text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-200/60 dark:border-teal-800/60'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="truncate">
                    <span className="block truncate">{fileName}</span>
                    {dirName && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block truncate">
                        {dirName}
                      </span>
                    )}
                  </div>
                  <FileCode2 className="w-3.5 h-3.5 shrink-0 opacity-60 ml-1.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="md:col-span-8 rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-md flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
            <div>
              <p className="text-xs font-bold font-mono text-zinc-200">{selectedFile.path}</p>
              <p className="text-[11px] text-zinc-400">{selectedFile.description}</p>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="py-1 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Preformatted code block */}
          <pre className="p-4 text-xs font-mono text-teal-300 bg-zinc-950 overflow-x-auto max-h-[440px] leading-relaxed">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
