
import { Level, Mission } from './types';

export const INTRO_TEXT = [
  "ANO 2084. BRASÍLIA, ZONA DE EXCLUSÃO.",
  "UMA FALHA CATASTRÓFICA NOS ALGORITMOS DE CONTROLE DA USINA NUCLEAR ANGRA IV AMEAÇA INCINERAR O HEMISFÉRIO SUL.",
  "OS CIRCUITOS LÓGICOS ESTÃO INCHADOS. A LATÊNCIA É CRÍTICA. O SISTEMA DE RESFRIAMENTO NÃO RESPONDE.",
  "VOCÊ, ENGENHEIRO SÊNIOR DA ABIN (AGÊNCIA BRASILEIRA DE INTELIGÊNCIA NUMÉRICA), É A ÚLTIMA ESPERANÇA.",
  "SIMPLIFIQUE A LÓGICA. OTIMIZE O FLUXO. SALVE O BRASIL."
];

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "PROTOCOLO DE CONTENÇÃO",
    briefing: [
      "MISSÃO 1: REINICIALIZAÇÃO DO NÚCLEO",
      "O núcleo do reator está instável. Os sensores estão enviando dados redundantes, causando lag no processador central.",
      "Sua tarefa é limpar os sinais básicos. Se o atraso continuar, o derretimento começa em breve."
    ],
    startLevelIndex: 0,
    endLevelIndex: 2
  },
  {
    id: 2,
    title: "SISTEMAS DE RESFRIAMENTO",
    briefing: [
      "MISSÃO 2: BOMBAS HIDRÁULICAS",
      "Conseguimos estabilizar o núcleo, mas as bombas de água do mar estão travadas por lógica condicional complexa.",
      "Os controladores antigos usam implicação excessiva. Converta para lógica booleana pura para forçar a ativação manual."
    ],
    startLevelIndex: 3,
    endLevelIndex: 5
  },
  {
    id: 3,
    title: "FIREWALL DE EMERGÊNCIA",
    briefing: [
      "MISSÃO 3: BLOQUEIO FINAL",
      "O vírus está tentando reescrever os protocolos de segurança. A lógica está invertida e distribuída incorretamente.",
      "Simplifique os circuitos para quebrar a criptografia do vírus e recuperar o controle total."
    ],
    startLevelIndex: 6,
    endLevelIndex: 7
  }
];

export const LEVELS: Level[] = [
  // MISSION 1
  {
    id: 1,
    missionId: 1,
    title: "Redundância de Sensores",
    description: "O sensor de temperatura (P) está duplicando o sinal para o validador. O sistema está calculando 'P ∧ P'. Isso gasta ciclos de CPU preciosos.",
    expression: "P ∧ P",
    variables: ["P"],
    optimalLength: 1,
    timeLimit: 45
  },
  {
    id: 2,
    missionId: 1,
    title: "Inversor Queimado",
    description: "Um relé defeituoso está negando o sinal duas vezes: '¬(¬P)'. Isso introduz atraso físico. Remova a negação dupla para conexão direta.",
    expression: "¬(¬P)",
    variables: ["P"],
    optimalLength: 1,
    timeLimit: 45 
  },
  {
    id: 3,
    missionId: 1,
    title: "Loop de Absorção",
    description: "O sistema de backup (P) está sendo verificado contra si mesmo desnecessariamente: '(P ∧ P) ∨ P'. O sinal P é soberano. Corte a verificação redundante.",
    expression: "(P ∧ P) ∨ P",
    variables: ["P"],
    optimalLength: 1,
    timeLimit: 90
  },

  // MISSION 2
  {
    id: 4,
    missionId: 2,
    title: "Válvula Condicional",
    description: "A válvula de fluxo usa uma instrução legada 'P → Q'. O hardware novo não suporta essa instrução nativamente e emula com lentidão.",
    expression: "P → Q",
    variables: ["P", "Q"],
    optimalLength: 4, // ¬P ∨ Q
    timeLimit: 300 // 5 minutes
  },
  {
    id: 5,
    missionId: 2,
    title: "Trava Bidirecional",
    description: "O controle da turbina verifica 'P ↔ Q'. Isso é um ciclo pesado. Simplifique isso para portas lógicas básicas (AND, OR, NOT) para o firmware de emergência.",
    expression: "P ↔ Q",
    variables: ["P", "Q"],
    optimalLength: 9, // (P ∧ Q) ∨ (¬P ∧ ¬Q) is standard, or similar equivalence
    timeLimit: 300 // 5 minutes
  },
  {
    id: 6,
    missionId: 2,
    title: "Erro de Distribuição",
    description: "O comando de injeção de urânio está expandido: '(P ∨ Q) ∧ (P ∨ R)'. O processador está engasgando. Simplifique para otimizar.",
    expression: "(P ∨ Q) ∧ (P ∨ R)",
    variables: ["P", "Q", "R"],
    optimalLength: 5, // P ∨ (Q ∧ R)
    timeLimit: 300 // 5 minutes
  },

  // MISSION 3
  {
    id: 7,
    missionId: 3,
    title: "Vírus letal",
    description: "O vírus bloqueou o sistema com '¬(P ∧ Q)'. Precisamos negar as entradas individualmente para contornar o bloqueio central.",
    expression: "¬(P ∧ Q)",
    variables: ["P", "Q"],
    optimalLength: 6, // ¬P ∨ ¬Q
    timeLimit: 45 // 5 seconds
  },
  {
    id: 8,
    missionId: 3,
    title: "Protocolo De Morgan",
    description: "Última linha de defesa. O bloqueio é '¬(P ∨ Q)'. Simplifique.",
    expression: "¬(P ∨ Q)",
    variables: ["P", "Q"],
    optimalLength: 6, // ¬P ∧ ¬Q
    timeLimit: 45 // 45 seconds
  }
];
