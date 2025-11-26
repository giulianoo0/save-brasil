
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CircuitNode, Connection, NodeType } from '../types';
import { Trash2, GripVertical, Play, XCircle } from 'lucide-react';

interface CircuitBuilderProps {
  variables: string[]; // P, Q, R...
  onExpressionChange: (expr: string) => void;
  resetTrigger?: boolean; // When true, resets the circuit nodes
}

const GRID_SIZE = 20;
const OUTPUT_ID = 'output_main';

const CircuitBuilder: React.FC<CircuitBuilderProps> = ({ variables, onExpressionChange, resetTrigger }) => {
  const [nodes, setNodes] = useState<CircuitNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  
  // Selection & Dragging
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Wiring State
  const [wiringSourceId, setWiringSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Board
  useEffect(() => {
    // We only create the output node initially. Inputs must be dragged in by the user.
    const initialNodes: CircuitNode[] = [
      {
        id: OUTPUT_ID,
        type: 'OUTPUT',
        label: 'SAÍDA',
        x: 0,
        y: 0,
        inputs: []
      }
    ];

    setNodes(initialNodes);
    setConnections([]);
    setSelectedNodeId(null);
    onExpressionChange('');
  }, [variables]); // Reset when variables/level changes

  // Reset nodes when resetTrigger changes
  useEffect(() => {
    if (resetTrigger) {
      const initialNodes: CircuitNode[] = [
        {
          id: OUTPUT_ID,
          type: 'OUTPUT',
          label: 'SAÍDA',
          x: 0,
          y: 0,
          inputs: []
        }
      ];

      setNodes(initialNodes);
      setConnections([]);
      setSelectedNodeId(null);
      setWiringSourceId(null);
      setDraggingNodeId(null);
      onExpressionChange('');
    }
  }, [resetTrigger, onExpressionChange]);

  // Center the output node after container is measured
  useEffect(() => {
    if (containerRef.current && nodes.length > 0) {
      const container = containerRef.current;
      const centerX = Math.max(0, container.clientWidth / 2 - 40); // -40 for half node width
      const centerY = Math.max(0, container.clientHeight / 2 - 20); // -20 for half node height
      
      setNodes(prev => prev.map(n => 
        n.id === OUTPUT_ID ? { ...n, x: centerX, y: centerY } : n
      ));
    }
  }, []);

  // Build Expression Logic
  useEffect(() => {
    const isAtom = (str: string) => /^[a-zA-Z0-9]+$/.test(str);

    const buildExpression = (nodeId: string, visited = new Set<string>()): string => {
      if (visited.has(nodeId)) return ''; // Cycle detection
      visited.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (!node) return '';

      // Base Case: User-placed Input Node
      if (node.type === 'INPUT') return node.label;
      
      // Find connections pointing TO this node
      const inputs = connections
        .filter(c => c.targetId === nodeId)
        .sort((a, b) => a.targetInputIndex - b.targetInputIndex);

      if (node.type === 'OUTPUT') {
        if (inputs.length === 0) return '';
        return buildExpression(inputs[0].sourceId, new Set(visited));
      }

      // Operators
      if (inputs.length === 0) return ''; // Incomplete gate

      if (node.type === 'NOT') {
        const srcExpr = buildExpression(inputs[0].sourceId, new Set(visited));
        if (!srcExpr) return '';
        // Simplify: ¬P instead of ¬(P)
        return isAtom(srcExpr) ? `¬${srcExpr}` : `¬(${srcExpr})`;
      }

      if (['AND', 'OR', 'IMPLIES', 'IFF'].includes(node.type)) {
        if (inputs.length < 2) return ''; // Need 2 inputs
        const left = buildExpression(inputs[0].sourceId, new Set(visited));
        const right = buildExpression(inputs[1].sourceId, new Set(visited));
        
        if (!left || !right) return '';

        let op = '';
        switch(node.type) {
            case 'AND': op = '∧'; break;
            case 'OR': op = '∨'; break;
            case 'IMPLIES': op = '→'; break;
            case 'IFF': op = '↔'; break;
        }
        
        return `(${left} ${op} ${right})`;
      }

      return '';
    };

    let expr = buildExpression(OUTPUT_ID);
    
    // Remove outer parentheses if present: (P ∧ Q) -> P ∧ Q
    if (expr.startsWith('(') && expr.endsWith(')')) {
        let depth = 0;
        let canStrip = true;
        for(let i=0; i<expr.length; i++) {
            if(expr[i] === '(') depth++;
            if(expr[i] === ')') depth--;
            if(depth === 0 && i < expr.length - 1) {
                canStrip = false; 
                break;
            }
        }
        if(canStrip && depth === 0) {
            expr = expr.slice(1, -1);
        }
    }

    onExpressionChange(expr);
  }, [nodes, connections, onExpressionChange]);

  // --- Actions ---

  const handleAddNode = (type: NodeType, labelOverride?: string) => {
    const id = `${type.toLowerCase()}_${Date.now()}`;
    let label = labelOverride || '';
    
    if (!label) {
        switch(type) {
            case 'AND': label = '∧'; break;
            case 'OR': label = '∨'; break;
            case 'NOT': label = '¬'; break;
            case 'IMPLIES': label = '→'; break;
            case 'IFF': label = '↔'; break;
        }
    }

    const newNode: CircuitNode = {
      id,
      type,
      label,
      x: 100 + Math.random() * 50, // Slight random offset
      y: 100 + Math.random() * 50,
      inputs: []
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
  };

  const removeNode = useCallback((id: string) => {
    if (id === OUTPUT_ID) return;
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.sourceId !== id && c.targetId !== id));
    
    // Clean up state references to avoid crashes
    if (selectedNodeId === id) setSelectedNodeId(null);
    if (wiringSourceId === id) setWiringSourceId(null);
    if (draggingNodeId === id) setDraggingNodeId(null);
  }, [selectedNodeId, wiringSourceId, draggingNodeId]);

  const disconnectInput = (nodeId: string, inputIndex: number) => {
    setConnections(prev => prev.filter(c => !(c.targetId === nodeId && c.targetInputIndex === inputIndex)));
  };

  // Keyboard Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        removeNode(selectedNodeId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, removeNode]);

  // --- Dragging Logic ---

  const startDrag = (e: React.PointerEvent, id: string) => {
    if ((e.target as HTMLElement).dataset.isport) return;
    if ((e.target as HTMLElement).dataset.isdelete) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Select on click
    setSelectedNodeId(id);
    
    const node = nodes.find(n => n.id === id);
    if (!node) return;

    const container = containerRef.current?.getBoundingClientRect();
    if (!container) return;

    setDraggingNodeId(id);
    setDragOffset({
      x: e.clientX - container.left - node.x,
      y: e.clientY - container.top - node.y
    });
    
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current?.getBoundingClientRect();
    if (!container) return;

    const x = e.clientX - container.left;
    const y = e.clientY - container.top;
    setMousePos({ x, y });

    if (draggingNodeId) {
      e.preventDefault();
      setNodes(prev => prev.map(n => {
        if (n.id === draggingNodeId) {
          return {
            ...n,
            x: Math.max(0, Math.min(container.width - 60, x - dragOffset.x)),
            y: Math.max(0, Math.min(container.height - 40, y - dragOffset.y))
          };
        }
        return n;
      }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (draggingNodeId) {
        setDraggingNodeId(null);
        if (e.target instanceof Element) {
          (e.target as Element).releasePointerCapture(e.pointerId);
        }
    }
  };

  // --- Wiring Logic ---

  const handlePortClick = (e: React.MouseEvent, nodeId: string, isOutput: boolean, inputIndex?: number) => {
    e.stopPropagation();
    
    if (isOutput) {
        // Start wiring
        setWiringSourceId(nodeId);
        setSelectedNodeId(nodeId);
    } else {
        // Input clicked
        
        // If already connected, assume user wants to DISCONNECT to edit (add between parents)
        const existingConnection = connections.find(c => c.targetId === nodeId && c.targetInputIndex === inputIndex);
        if (existingConnection && !wiringSourceId) {
            disconnectInput(nodeId, inputIndex!);
            return;
        }

        if (!wiringSourceId) return;
        if (wiringSourceId === nodeId) return; // Self-loop check

        setConnections(prev => {
            // Remove existing connection to this specific input slot (overwrite)
            const filtered = prev.filter(c => !(c.targetId === nodeId && c.targetInputIndex === inputIndex));
            return [...filtered, {
                id: `${wiringSourceId}-${nodeId}-${inputIndex}-${Date.now()}`,
                sourceId: wiringSourceId,
                targetId: nodeId,
                targetInputIndex: inputIndex!
            }];
        });
        setWiringSourceId(null);
    }
  };

  const handleBackgroundClick = () => {
    setWiringSourceId(null);
    setSelectedNodeId(null);
  };

  // --- Styles & Helpers ---

  const getNodeStyle = (type: NodeType) => {
    switch(type) {
      case 'INPUT': return 'bg-cyan-900 border-cyan-500 text-cyan-100';
      case 'OUTPUT': return 'bg-green-900 border-green-500 text-green-100';
      case 'AND': return 'bg-yellow-900 border-yellow-500 text-yellow-100';
      case 'OR': return 'bg-orange-900 border-orange-500 text-orange-100';
      case 'NOT': return 'bg-red-900 border-red-500 text-red-100';
      case 'IMPLIES': return 'bg-blue-900 border-blue-500 text-blue-100';
      case 'IFF': return 'bg-purple-900 border-purple-500 text-purple-100';
      default: return 'bg-gray-800 border-gray-600';
    }
  };

  const getInputPos = (node: CircuitNode, index: number, total: number) => {
    const spacing = 24;
    if (total === 1) return { x: node.x, y: node.y + 20 }; 
    const startY = node.y + 20 - ((total - 1) * spacing) / 2;
    return { x: node.x, y: startY + index * spacing };
  };

  const getOutputPos = (node: CircuitNode) => {
    return { x: node.x + 80, y: node.y + 20 };
  };

  // Safe lookup for wiring node to prevent crash if it was deleted
  const wiringNode = wiringSourceId ? nodes.find(n => n.id === wiringSourceId) : null;

  return (
    <div className="flex flex-col h-full select-none" onClick={handleBackgroundClick}>
      
      {/* Toolbar */}
      <div className="bg-[#0a0a0a] border-b border-green-900 p-2 flex flex-wrap gap-4 items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-xs text-green-700 font-bold uppercase mr-2">Entradas:</span>
                {variables.map(v => (
                    <button
                        key={v}
                        onClick={() => handleAddNode('INPUT', v)}
                        className="w-10 h-10 flex items-center justify-center bg-cyan-950 border border-cyan-600 rounded hover:bg-cyan-800 hover:scale-110 transition-all text-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                        title={`Adicionar variável ${v}`}
                    >
                        {v}
                    </button>
                ))}
            </div>
            
            <div className="h-8 w-px bg-green-900/50"></div>
            
            <div className="flex items-center gap-2">
                <span className="text-xs text-green-700 font-bold uppercase mr-2">Portas:</span>
                {[
                    { type: 'AND', label: '∧' },
                    { type: 'OR', label: '∨' },
                    { type: 'NOT', label: '¬' },
                    { type: 'IMPLIES', label: '→' },
                    { type: 'IFF', label: '↔' }
                ].map(gate => (
                    <button
                        key={gate.type}
                        onClick={() => handleAddNode(gate.type as NodeType)}
                        className={`h-9 px-3 flex items-center gap-2 border rounded hover:scale-105 transition-all text-sm font-bold shadow-lg
                            ${getNodeStyle(gate.type as NodeType).split(' ')[0]} 
                            ${getNodeStyle(gate.type as NodeType).split(' ')[1]} 
                            ${getNodeStyle(gate.type as NodeType).split(' ')[2]}`}
                        title={`Adicionar porta ${gate.type}`}
                    >
                        {gate.label}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <button
                onClick={() => selectedNodeId && removeNode(selectedNodeId)}
                disabled={!selectedNodeId || selectedNodeId === OUTPUT_ID}
                className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase transition-all
                    ${selectedNodeId && selectedNodeId !== OUTPUT_ID 
                        ? 'bg-red-900/40 border border-red-500 text-red-400 hover:bg-red-600 hover:text-white' 
                        : 'bg-gray-900 border border-gray-800 text-gray-700 cursor-not-allowed'}
                `}
            >
                <Trash2 size={14} /> Deletar
            </button>
        </div>
      </div>

      {/* Connection Info Overlay */}
      <div className="absolute top-16 left-0 right-0 pointer-events-none flex justify-center z-40">
        {wiringSourceId && (
            <div className="bg-yellow-900/90 text-yellow-200 px-4 py-1 rounded-full text-xs font-bold animate-pulse border border-yellow-500 shadow-lg">
                SELECIONE O DESTINO DA CONEXÃO (Esc para cancelar)
            </div>
        )}
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="relative flex-1 bg-[#050505] overflow-hidden cursor-crosshair"
        style={{ touchAction: 'none' }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: `linear-gradient(#004411 1px, transparent 1px), linear-gradient(90deg, #004411 1px, transparent 1px)`, 
               backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px` 
             }} 
        />

        {/* Wires (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
             <defs>
                <filter id="wire-glow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            {connections.map(conn => {
                const source = nodes.find(n => n.id === conn.sourceId);
                const target = nodes.find(n => n.id === conn.targetId);
                if (!source || !target) return null;

                const start = getOutputPos(source);
                let inputCount = (target.type === 'NOT' || target.type === 'OUTPUT') ? 1 : 2;
                const end = getInputPos(target, conn.targetInputIndex, inputCount);

                const cp1x = start.x + Math.abs(end.x - start.x) * 0.5;
                const cp2x = end.x - Math.abs(end.x - start.x) * 0.5;

                return (
                    <path
                        key={conn.id}
                        d={`M ${start.x} ${start.y} C ${cp1x} ${start.y}, ${cp2x} ${end.y}, ${end.x} ${end.y}`}
                        stroke="#00ff41"
                        strokeWidth="3"
                        fill="none"
                        className="opacity-70 transition-all"
                        filter="url(#wire-glow)"
                    />
                );
            })}
             {wiringSourceId && wiringNode && (
                <path 
                  d={`M ${getOutputPos(wiringNode).x} ${getOutputPos(wiringNode).y} L ${mousePos.x} ${mousePos.y}`}
                  stroke="#ffff00"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  fill="none"
                />
             )}
        </svg>

        {/* Nodes */}
        {nodes.map(node => {
            const isFixed = node.type === 'OUTPUT';
            const inputCount = (node.type === 'NOT' || node.type === 'OUTPUT') ? 1 : (node.type === 'INPUT' ? 0 : 2);
            const isSelected = selectedNodeId === node.id;
            
            return (
                <div
                    key={node.id}
                    className={`absolute w-20 h-10 rounded shadow-md flex items-center justify-center border-2 transition-transform z-10
                        ${getNodeStyle(node.type)}
                        ${draggingNodeId === node.id ? 'scale-110 shadow-2xl z-50 cursor-grabbing' : 'cursor-grab'}
                        ${isSelected ? 'ring-2 ring-white scale-105 z-40' : ''}
                        ${wiringSourceId === node.id ? 'ring-2 ring-yellow-400' : ''}
                    `}
                    style={{ left: node.x, top: node.y }}
                    onPointerDown={(e) => startDrag(e, node.id)}
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className="font-bold text-lg pointer-events-none select-none">{node.label}</span>
                    
                    {/* Delete Button (Visible on Selection) */}
                    {isSelected && !isFixed && (
                        <div 
                            className="absolute -top-3 -right-3 cursor-pointer z-50 pointer-events-auto"
                            data-isdelete="true"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                removeNode(node.id);
                            }}
                        >
                             <div className="bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors transform hover:scale-110">
                                <XCircle size={14} />
                             </div>
                        </div>
                    )}

                    {/* Inputs */}
                    {node.type !== 'INPUT' && Array.from({ length: inputCount }).map((_, idx) => {
                        const pos = getInputPos(node, idx, inputCount);
                        // Convert absolute to relative
                        const relTop = pos.y - node.y - 8; // -8 to center the 16px dot
                        const relLeft = -10; 

                        const isConnected = connections.some(c => c.targetId === node.id && c.targetInputIndex === idx);

                        return (
                            <div
                                key={`in-${idx}`}
                                data-isport="true"
                                className={`absolute w-4 h-4 rounded-full border-2 border-black z-20 cursor-pointer transition-all
                                    ${isConnected ? 'bg-green-400 hover:bg-red-500' : 'bg-gray-600 hover:bg-white'}
                                    ${wiringSourceId ? 'animate-pulse bg-white ring-2 ring-yellow-500' : ''}
                                `}
                                style={{ top: relTop, left: relLeft }}
                                onClick={(e) => handlePortClick(e, node.id, false, idx)}
                                title={isConnected ? "Clique para desconectar" : "Clique para conectar"}
                            />
                        );
                    })}

                    {/* Output Port */}
                    {node.type !== 'OUTPUT' && (
                         <div
                            data-isport="true"
                            className={`absolute w-4 h-4 rounded-full border-2 border-black -right-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer hover:scale-125 transition-all
                                ${wiringSourceId === node.id ? 'bg-yellow-400 scale-125' : 'bg-green-500 hover:bg-green-300'}
                            `}
                            onClick={(e) => handlePortClick(e, node.id, true)}
                         />
                    )}
                </div>
            );
        })}

      </div>
    </div>
  );
};

export default CircuitBuilder;
