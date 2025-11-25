
import React, { useMemo } from 'react';

interface CircuitVisualizerProps {
  expression: string;
}

// A simple parser/renderer that visualizes the structure as a tree (simplified for demo)
const CircuitVisualizer: React.FC<CircuitVisualizerProps> = ({ expression }) => {
  
  const tokens = useMemo(() => {
    // Split by spaces, brackets, and symbols
    // The expression might be "P ∧ Q" or "¬(P)"
    // We pad symbols with spaces to ensure clean split
    const padSymbols = expression
        .replace(/\(/g, ' ( ')
        .replace(/\)/g, ' ) ')
        .replace(/∧/g, ' ∧ ')
        .replace(/∨/g, ' ∨ ')
        .replace(/¬/g, ' ¬ ')
        .replace(/→/g, ' → ')
        .replace(/↔/g, ' ↔ ');
        
    return padSymbols.split(/\s+/).filter(t => t.trim().length > 0);
  }, [expression]);

  return (
    <div className="w-full p-6 bg-black/40 border border-green-900/50 rounded-lg font-mono text-sm overflow-x-auto shadow-[0_0_15px_rgba(0,255,65,0.1)]">
      <div className="flex flex-wrap items-center justify-center gap-2 min-h-[60px]">
        {tokens.map((token, idx) => {
          let colorClass = "text-gray-400";
          let borderClass = "border-transparent";

          if (['∧', '∨', '¬', '→', '↔', 'AND', 'OR', 'NOT', 'IMPLIES', 'IFF'].includes(token)) {
            colorClass = "text-yellow-400 font-bold text-lg";
            borderClass = "border-yellow-900/30 bg-yellow-900/10 px-3 py-1 rounded";
          } else if (['P', 'Q', 'R', 'S', 'T'].includes(token)) {
            colorClass = "text-cyan-400 font-bold text-lg";
            borderClass = "border-cyan-900/30 bg-cyan-900/10 px-4 py-2 rounded-full border";
          } else if (token === '(' || token === ')') {
            colorClass = "text-green-600 font-bold";
          }

          return (
            <span key={idx} className={`${colorClass} ${borderClass} transition-all duration-300 hover:scale-110 cursor-default select-none`}>
              {token}
            </span>
          );
        })}
      </div>
      <div className="mt-4 flex justify-center">
        <div className="h-px w-3/4 bg-gradient-to-r from-transparent via-green-900 to-transparent"></div>
      </div>
      <div className="text-center mt-2 text-xs text-green-800 uppercase tracking-widest">
        Topologia do Circuito
      </div>
    </div>
  );
};

export default CircuitVisualizer;
