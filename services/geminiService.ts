import { GoogleGenAI } from "@google/genai";
import { Level } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHintForLevel = async (level: Level): Promise<string> => {
  try {
    const model = ai.models;
    const prompt = `
      Estou jogando um jogo de lógica booleana.
      Tenho a expressão: "${level.expression}".
      As variáveis são: ${level.variables.join(', ')}.
      Preciso simplificá-la.
      Me dê uma dica curta e direta em Português (Brasil) sobre qual regra lógica aplicar (ex: De Morgan, Absorção, Distributiva).
      Use os símbolos ∧ (AND), ∨ (OR), ¬ (NOT) se precisar citar operadores.
      Não dê a resposta final, apenas a dica teórica.
      Mantenha o tom de um assistente de IA cyberpunk ("Protocolo de Otimização Iniciado...").
    `;

    const result = await model.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return result.text || "Erro no link de dados. Sem dica disponível.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro de conexão com o mainframe. Tente novamente.";
  }
};

export const generateInfiniteLevel = async (difficulty: number): Promise<Level | null> => {
  try {
    const model = ai.models;
    // Difficulty 1-3
    const prompt = `
      Gere um nível para um jogo de simplificação lógica booleana.
      Dificuldade: ${difficulty} (1 = fácil, 3 = difícil).
      Variáveis permitidas: P, Q, R, S, T.
      Responda APENAS com um objeto JSON.
      Schema:
      {
        "expression": "expressão aqui (use SÍMBOLOS: ∧, ∨, ¬)",
        "variables": ["P", "Q", ...],
        "title": "Título Cyberpunk em Português",
        "description": "Descrição técnica em Português sobre a ineficiência"
      }
      A expressão DEVE ser simplificável.
      Exemplo de expressão: "(P ∧ Q) ∨ P"
      Não inclua markdown code blocks.
    `;

    const result = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          responseMimeType: "application/json"
      }
    });

    const text = result.text;
    if (!text) return null;

    const data = JSON.parse(text);
    
    return {
      id: Date.now(),
      missionId: 0,
      title: data.title,
      description: data.description,
      expression: data.expression,
      variables: data.variables,
      optimalLength: 1, // Dynamic check will handle this
      timeLimit: 60 + (difficulty * 30) // 1=90s, 2=120s, 3=150s
    };

  } catch (error) {
    console.error("Gemini Generator Error:", error);
    return null;
  }
};