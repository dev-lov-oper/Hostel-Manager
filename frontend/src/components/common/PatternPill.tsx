import React from 'react';
import { Layers } from 'lucide-react';

interface PatternPillProps {
  name: string;
  category?: string;
  className?: string;
  onClick?: () => void;
}

export const PatternPill: React.FC<PatternPillProps> = ({ name, category, className = '', onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium 
        bg-brand-violet/10 border border-brand-violet/30 text-brand-sky hover:bg-brand-violet/20 
        hover:border-brand-violet/60 transition-all cursor-pointer ${className}`}
      title={`Design Pattern: ${name} (${category || 'Structural/Behavioral/Creational'})`}
    >
      <Layers className="w-3 h-3 text-brand-purple" />
      <span>{name}</span>
      {category && (
        <span className="text-[10px] text-slate-400 font-sans opacity-70">
          • {category}
        </span>
      )}
    </button>
  );
};
