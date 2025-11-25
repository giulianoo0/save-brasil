
import React, { useState } from 'react';
import { GameState, Mission } from './types';
import { LEVELS, MISSIONS, INTRO_TEXT } from './constants';
import LevelView from './components/LevelView';
import StoryView from './components/StoryView';
import { Terminal, Play, CheckCircle } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);

  // Get current active level
  const currentLevel = LEVELS[currentLevelIndex];

  const startCampaign = () => {
    setCurrentLevelIndex(0);
    setGameState(GameState.INTRO);
  };

  const handleIntroComplete = () => {
    // Determine first mission
    const firstMission = MISSIONS.find(m => m.startLevelIndex === 0);
    if (firstMission) {
        setCurrentMission(firstMission);
        setGameState(GameState.BRIEFING);
    } else {
        setGameState(GameState.PLAYING);
    }
  };

  const handleBriefingComplete = () => {
    setGameState(GameState.PLAYING);
  };

  const handleLevelComplete = () => {
    setTimeout(() => {
      const nextIndex = currentLevelIndex + 1;
      
      if (nextIndex >= LEVELS.length) {
        setGameState(GameState.VICTORY);
        return;
      }

      // Check if next level belongs to a new mission
      const nextLevel = LEVELS[nextIndex];
      const nextMission = MISSIONS.find(m => m.id === nextLevel.missionId);

      // If mission ID changed, show briefing
      if (nextMission && nextMission.id !== currentMission?.id) {
          setCurrentLevelIndex(nextIndex);
          setCurrentMission(nextMission);
          setGameState(GameState.BRIEFING);
      } else {
          setCurrentLevelIndex(nextIndex);
          // Stay in PLAYING state
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#050505] text-[#00ff41] font-mono selection:bg-[#00ff41] selection:text-black">
      
      {/* Navbar */}
      <nav className="w-full p-4 border-b border-green-900 flex justify-between items-center bg-black/80 backdrop-blur-sm z-10 sticky top-0">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tighter cursor-pointer" onClick={() => setGameState(GameState.MENU)}>
          <Terminal size={24} />
          <span className="hidden md:inline">SALVE O BRASIL</span>
          <span className="md:hidden">ANGRA IV</span>
        </div>
        <div className="flex gap-4 text-xs uppercase tracking-widest text-green-700">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${gameState === GameState.PLAYING ? 'bg-green-500 animate-pulse' : 'bg-green-900'}`}></span>
            {gameState === GameState.PLAYING ? 'SISTEMA CRÍTICO' : 'STANDBY'}
          </div>
          {currentMission && gameState !== GameState.MENU && (
              <div className="text-green-500 font-bold border-l border-green-900 pl-4">
                  {currentMission.title}
              </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative">
        
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-10">
           <div className="absolute top-10 left-10 w-64 h-64 border border-green-900 rounded-full animate-pulse"></div>
           <div className="absolute bottom-20 right-20 w-96 h-96 border border-green-900 rounded-full border-dashed spin-slow"></div>
        </div>

        <div className="z-10 w-full max-w-6xl">
          
          {gameState === GameState.MENU && (
            <div className="text-center space-y-12 animate-fade-in relative">
              <div className="space-y-4">
                <div className="inline-block px-4 py-1 border border-red-900 bg-red-900/10 text-red-500 text-xs tracking-[0.2em] mb-4">
                    ALERTA DE FUSÃO NUCLEAR
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-800">
                  SALVE <br/> O BRASIL
                </h1>
                <p className="text-green-600 text-lg max-w-md mx-auto">
                  A usina de Angra IV entrou em colapso lógico. <br/>
                  Assuma o controle do terminal e simplifique o código antes que o reator derreta.
                </p>
              </div>

              <div className="flex flex-col justify-center items-center">
                <button 
                  onClick={startCampaign}
                  className="group relative px-12 py-6 bg-green-900/20 border border-green-500 text-green-400 text-xl font-bold uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Play size={24} /> ACESSAR TERMINAL
                  </span>
                  <div className="absolute inset-0 bg-green-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out"></div>
                </button>
              </div>
              
              <div className="text-xs text-green-800 mt-12 font-mono">
                MINISTÉRIO DE MINAS E ENERGIA - PROTOCOLO 2084
              </div>
            </div>
          )}

          {gameState === GameState.INTRO && (
              <StoryView 
                lines={INTRO_TEXT} 
                title="RELATÓRIO DE INCIDENTE"
                onComplete={handleIntroComplete} 
              />
          )}

          {gameState === GameState.BRIEFING && currentMission && (
              <StoryView 
                lines={currentMission.briefing} 
                title={currentMission.title}
                onComplete={handleBriefingComplete} 
              />
          )}

          {gameState === GameState.PLAYING && currentLevel && (
            <LevelView 
              level={currentLevel} 
              onComplete={handleLevelComplete}
              onBack={() => setGameState(GameState.MENU)}
            />
          )}

          {gameState === GameState.VICTORY && (
            <div className="text-center space-y-8 animate-fade-in bg-black/90 p-12 border border-green-500 rounded shadow-[0_0_50px_rgba(0,255,65,0.2)]">
              <CheckCircle size={64} className="mx-auto text-green-500" />
              <h2 className="text-4xl font-bold text-green-400">ANGRA IV ESTABILIZADA</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Todos os subsistemas reportam eficiência de 100%. O resfriamento foi restaurado. 
                A radiação está contida. O Brasil está salvo, graças à sua lógica impecável.
              </p>
              <button 
                onClick={() => setGameState(GameState.MENU)}
                className="px-8 py-3 bg-green-900/40 hover:bg-green-500 hover:text-black border border-green-500 text-green-400 font-bold rounded uppercase tracking-wider transition-all"
              >
                Voltar ao Menu Principal
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
