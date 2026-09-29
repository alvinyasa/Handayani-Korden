import React from 'react';
import { Table, LayoutGrid, Image as ImageIcon } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'stock', label: 'Stok Kain', icon: Table },
    { id: 'models', label: 'Model Korden', icon: LayoutGrid },
    { id: 'installations', label: 'Pemasangan', icon: ImageIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-[#444444] pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] px-3 shadow-lg transition-colors duration-200">
      <div className="max-w-md mx-auto grid grid-cols-3 gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all active-press ${
                isActive
                  ? 'text-[#d96b27] dark:text-orange-400'
                  : 'text-slate-400 dark:text-[#888888] hover:text-slate-600 dark:hover:text-[#E0E0E0]'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-50 dark:bg-orange-950/60 text-[#d96b27] dark:text-orange-400 scale-105 shadow-xs ring-1 ring-orange-200/60 dark:ring-orange-800/60'
                    : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-extrabold text-[#d96b27] dark:text-orange-400' : 'text-slate-500 dark:text-[#888888] font-semibold'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
