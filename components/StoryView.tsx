
import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

interface StoryViewProps {
  lines: string[];
  title?: string;
  onComplete: () => void;
}

const StoryView: React.FC<StoryViewProps> = ({ lines, title, onComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex >= lines.length) return;

    const line = lines[currentLineIndex];
    if (charIndex < line.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + line[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 30); // Typing speed
      return () => clearTimeout(timeout);
    } else {
       // Auto advance line after delay
       const timeout = setTimeout(() => {
          if (currentLineIndex < lines.length - 1) {
              setCurrentLineIndex(prev => prev + 1);
              setDisplayedText('');
              setCharIndex(0);
          }
       }, 1500);
       return () => clearTimeout(timeout);
    }
  }, [charIndex, currentLineIndex, lines]);

  const isFinished = currentLineIndex === lines.length - 1 && charIndex === lines[lines.length - 1].length;

  return (
    <div className="w-full max-w-4xl mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in bg-black border border-green-900 shadow-[0_0_50px_rgba(0,50,0,0.5)]">
      
      {title && (
          <div className="mb-8 border-b-2 border-green-600 pb-2 w-full text-center">
             <h2 className="text-3xl md:text-4xl font-bold text-green-500 tracking-tighter uppercase flicker-text">
                {title}
             </h2>
          </div>
      )}

      <div className="w-full font-mono text-lg md:text-xl text-green-400 leading-relaxed min-h-[200px] whitespace-pre-wrap">
        <span className="text-green-700 mr-2">{'>'}</span>
        {currentLineIndex < lines.length ? (
            <>
                {lines.slice(0, currentLineIndex).map((l, i) => (
                    <div key={i} className="mb-4 opacity-50">{l}</div>
                ))}
                <span>{displayedText}</span>
                <span className="animate-pulse inline-block w-3 h-5 bg-green-500 ml-1 align-middle"></span>
            </>
        ) : (
            lines.map((l, i) => <div key={i} className="mb-4">{l}</div>)
        )}
      </div>

      <div className="mt-12 w-full flex justify-end">
        <button
          onClick={onComplete}
          className={`px-8 py-3 bg-green-900 text-green-100 font-bold uppercase tracking-widest hover:bg-green-600 transition-all border border-green-500 ${isFinished ? 'animate-pulse' : 'opacity-50'}`}
        >
          {isFinished ? 'INICIAR MISSÃO >>' : 'PULAR DADOS >>'}
        </button>
      </div>
    </div>
  );
};

export default StoryView;
