
import React, { useState, useEffect, useRef } from 'react';
import { Level, EvaluationResult } from '../types';
import { areExpressionsEquivalent, getComplexityScore } from '../utils/logicEngine';
import CircuitVisualizer from './CircuitVisualizer';
import CircuitBuilder from './CircuitBuilder';
import { Zap, Cpu, AlertTriangle, ArrowLeft, Timer, RotateCcw } from 'lucide-react';

interface LevelViewProps {
  level: Level;
  onComplete: () => void;
  onBack: () => void;
}

const LevelView: React.FC<LevelViewProps> = ({ level, onComplete, onBack }) => {
  const [expressionInput, setExpressionInput] = useState('');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [isGameOver, setIsGameOver] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Reset state when level changes
  useEffect(() => {
    setExpressionInput('');
    setResult(null);
    setTimeLeft(level.timeLimit);
    setIsGameOver(false);
  }, [level]);

  // Timer Logic
  useEffect(() => {
    if (isGameOver || (result && result.correct)) {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
    }

    timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
            if (prev <= 1) {
                if (timerRef.current) clearInterval(timerRef.current);
                setIsGameOver(true);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOver, result, level]);

  const handleCheck = () => {
    if (isGameOver) return;

    const safeInput = expressionInput.trim();

    // Determine correctness
    const isEquivalent = areExpressionsEquivalent(level.expression, safeInput, level.variables);
    const inputScore = getComplexityScore(safeInput);
    const targetScore = level.optimalLength;
    
    // Heuristic: Is it simpler or equal to the best known simplification?
    // We give a small buffer (+1) but generally want it optimized.
    const isOptimal = inputScore <= targetScore;

    if (isEquivalent) {
        if (isOptimal) {
            setResult({
                correct: true,
                equivalent: true,
                simpler: true,
                message: "CIRCUITO ESTABILIZADO. EFICIÊNCIA MÁXIMA ALCANÇADA."
            });
            setTimeout(onComplete, 1500);
        } else {
            setResult({
                correct: false,
                equivalent: true,
                simpler: false,
                message: `LÓGICA CORRETA, MAS COMPLEXA DEMAIS. (Score: ${inputScore} / Meta: ${targetScore})`
            });
        }
    } else {
        setResult({
            correct: false,
            equivalent: false,
            simpler: false,
            message: "TABELA VERDADE INCOMPATÍVEL. A LÓGICA NÃO CORRESPONDE."
        });
    }
  };

  const handleRetry = () => {
    setExpressionInput('');
    setResult(null);
    setTimeLeft(level.timeLimit);
    setIsGameOver(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeCritical = timeLeft <= 10;

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in pb-12 relative">
      
      {/* Game Over Overlay */}
      {isGameOver && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg border border-red-900">
              <div className="text-center space-y-6 animate-bounce-in p-8 bg-black border border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.4)]">
                  <AlertTriangle size={64} className="mx-auto text-red-500 animate-pulse" />
                  <div>
                      <h2 className="text-4xl font-bold text-red-500">FALHA CRÍTICA</h2>
                      <p className="text-red-300 mt-2 font-mono">TEMPO ESGOTADO. O REATOR ENTROU EM COLAPSO.</p>
                  </div>
                  <button 
                      onClick={handleRetry}
                      className="px-8 py-3 bg-red-900/50 hover:bg-red-600 text-white font-bold uppercase tracking-widest border border-red-500 rounded transition-all flex items-center gap-2 mx-auto"
                  >
                      <RotateCcw size={20} /> REINICIAR SISTEMA
                  </button>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-green-900 pb-4">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="p-2 hover:bg-green-900/30 text-green-600 rounded-full transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-green-400 shadow-green-glow">
                  NÍVEL {level.id}: <span className="text-white">{level.title}</span>
                </h2>
                <p className="text-green-800 text-xs font-mono uppercase tracking-widest mt-1">
                    META DE COMPLEXIDADE: {level.optimalLength} | VARIÁVEIS: {level.variables.join(', ')}
                </p>
            </div>
        </div>
        
        {/* Timer Display */}
        <div className={`flex items-center gap-3 px-6 py-2 rounded border-2 font-mono text-xl font-bold shadow-lg transition-all duration-500 ${isTimeCritical ? 'bg-red-900/20 border-red-500 text-red-500 animate-pulse' : 'bg-green-900/10 border-green-500/50 text-green-400'}`}>
            <Timer size={24} className={isTimeCritical ? 'animate-spin' : ''} />
            {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Mission Info */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
            <div className="bg-gray-900/50 p-4 rounded border-l-4 border-green-600">
                <h3 className="text-green-400 text-sm font-bold mb-2 flex items-center gap-2">
                    <Cpu size={16} />
                    OBJETIVO
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {level.description}
                </p>
                <div className="p-3 bg-black/40 rounded border border-green-900/30">
                    <span className="text-xs text-green-700 block mb-1">CIRCUITO ORIGINAL:</span>
                    <code className="text-green-300 font-bold break-words text-sm">{level.expression}</code>
                </div>
            </div>

            <div className="hidden lg:block">
                <span className="text-xs text-green-800 uppercase block mb-2">Visualização Alvo</span>
                <CircuitVisualizer expression={level.expression} />
            </div>

            <div className="mt-auto pt-6">
              <button 
                  onClick={handleCheck}
                  disabled={isGameOver}
                  className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-4 px-4 rounded shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] uppercase tracking-wider transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <Zap size={20} className="fill-current" />
                  VERIFICAR SOLUÇÃO
              </button>
            </div>
        </div>

        {/* Right Column: Circuit Builder */}
        <div className="lg:col-span-9 flex flex-col gap-4">
            {/* Feedback Bar */}
            <div className={`w-full p-3 rounded font-mono text-sm border flex items-center gap-3 transition-all duration-300 ${
                !result 
                    ? 'bg-gray-900/50 border-green-900/30 text-gray-500' 
                    : result.correct 
                        ? 'bg-green-900/30 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                        : 'bg-red-900/20 border-red-500 text-red-400'
            }`}>
                {result ? (
                    <>
                        {result.correct ? <Zap size={18} /> : <AlertTriangle size={18} />}
                        <span className="font-bold">{result.message}</span>
                    </>
                ) : (
                    <>
                        <div className="w-2 h-2 bg-green-900 rounded-full animate-pulse"></div>
                        <span>Aguardando montagem do circuito...</span>
                    </>
                )}
            </div>

            {/* Main Builder Area */}
            <div className="bg-gray-900/30 rounded-lg border border-green-900/30 flex-1 min-h-[550px] relative overflow-hidden">
                 <CircuitBuilder 
                    variables={level.variables} 
                    onExpressionChange={setExpressionInput}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default LevelView;
