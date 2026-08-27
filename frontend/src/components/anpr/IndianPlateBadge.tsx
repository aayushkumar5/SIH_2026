import React from 'react';
import { validateAndNormalizePlate } from '../../utils/plateValidator';

interface IndianPlateBadgeProps {
  plateNumber: string;
  isHotlisted?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const IndianPlateBadge: React.FC<IndianPlateBadgeProps> = ({
  plateNumber,
  isHotlisted = false,
  size = 'md',
}) => {
  const result = validateAndNormalizePlate(plateNumber);

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 border',
    md: 'text-xs px-3 py-1 border-[1.5px]',
    lg: 'text-base px-4 py-1.5 border-2',
  };

  const isBharat = result.format === 'BHARAT_SERIES';
  const isMilitary = result.format === 'MILITARY';

  return (
    <div className="inline-flex flex-col items-start gap-0.5 font-mono select-none">
      <div
        className={`inline-flex items-center gap-2 rounded-md font-bold tracking-wider uppercase transition-all shadow-md ${
          sizeClasses[size]
        } ${
          isHotlisted
            ? 'bg-amber-400 text-black border-red-600 ring-2 ring-red-500/50'
            : isMilitary
            ? 'bg-emerald-900/80 text-emerald-200 border-emerald-500'
            : isBharat
            ? 'bg-blue-950/80 text-cyan-200 border-cyan-500'
            : 'bg-white text-slate-900 border-gray-400'
        }`}
      >
        {/* Left IND / Chakra Tag */}
        <div className="flex items-center gap-1 border-r border-current pr-1.5 opacity-80 text-[80%] font-black">
          {isMilitary ? (
            <span>↑IA</span>
          ) : (
            <div className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span>
              <span>IND</span>
            </div>
          )}
        </div>

        {/* Plate text */}
        <span className="tracking-widest">{result.normalized || plateNumber}</span>
      </div>

      {result.description && size !== 'sm' && (
        <span className="text-[9px] text-slate-400 font-mono pl-0.5">
          {result.description}
        </span>
      )}
    </div>
  );
};
