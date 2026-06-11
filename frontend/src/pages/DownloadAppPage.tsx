import React from 'react';
import { Download, CheckCircle, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';

export default function DownloadAppPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-6 text-white font-sans">
      
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Column - Hero Content */}
        <div className="space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Smartphone className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wide uppercase">Official Mobile App</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
              Shop RKS on the Go
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
              Manage inventory, track billing, and review reports directly from your Android device. Fast, secure, and built for employees.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/ShopRKS.apk"
              download
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-indigo-600 rounded-2xl hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <Download className="w-6 h-6 mr-3 transition-transform group-hover:-translate-y-1" />
              <span>Download APK</span>
            </a>
            
            <div className="flex items-center space-x-3 text-slate-400 text-sm px-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Verified Safe<br/>Internal Release</span>
            </div>
          </div>
        </div>

        {/* Right Column - App Details Card */}
        <div className="glass-card relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 transition-opacity group-hover:bg-indigo-500/20"></div>
          
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">App Details</span>
          </h3>

          <div className="space-y-6">
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-slate-400">Version</span>
              <span className="font-semibold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-lg">v1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-slate-400">Size</span>
              <span className="font-semibold text-white">~ 5 MB</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-slate-400">OS Requirement</span>
              <span className="font-semibold text-white">Android 8.0+</span>
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Installation Guide</h4>
              <ul className="space-y-4">
                {[
                  'Download the APK file to your device.',
                  'Open the downloaded file.',
                  'If prompted, allow "Install from Unknown Sources".',
                  'Click Install and log in with your employee credentials.'
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start text-sm text-slate-400">
                    <CheckCircle className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
