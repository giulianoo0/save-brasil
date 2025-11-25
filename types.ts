
export enum GameState {
  MENU = 'MENU',
  INTRO = 'INTRO',
  BRIEFING = 'BRIEFING',
  PLAYING = 'PLAYING',
  VICTORY = 'VICTORY',
  LEVEL_SELECT = 'LEVEL_SELECT'
}

export interface Mission {
  id: number;
  title: string;
  briefing: string[];
  startLevelIndex: number;
  endLevelIndex: number;
}

export interface Level {
  id: number;
  missionId: number;
  title: string;
  description: string;
  expression: string; // The complex expression
  variables: string[]; // ['P', 'Q', 'R']
  optimalLength: number; // Heuristic for simplest answer length
  timeLimit: number; // Seconds to complete the level
}

export type EvaluationResult = {
  correct: boolean;
  equivalent: boolean; // It is logically equivalent
  simpler: boolean; // It is shorter/simpler than original
  message: string;
};

// Circuit Builder Types
export type NodeType = 'INPUT' | 'OUTPUT' | 'AND' | 'OR' | 'NOT' | 'IMPLIES' | 'IFF';

export interface CircuitNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  inputs: string[]; // IDs of connected nodes
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  targetInputIndex: number;
}