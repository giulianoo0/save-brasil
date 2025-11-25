/**
 * Tokenizes the logical expression.
 */
const tokenize = (expr: string): string[] => {
  if (!expr) return [];
  
  // Add spaces around symbols to make splitting easier
  const safeExpr = expr
    .replace(/\(/g, ' ( ')
    .replace(/\)/g, ' ) ')
    .replace(/∧/g, ' AND ')
    .replace(/∨/g, ' OR ')
    .replace(/¬/g, ' NOT ')
    .replace(/→/g, ' IMPLIES ')
    .replace(/↔/g, ' IFF ');

  return safeExpr.trim().split(/\s+/).filter(t => t.length > 0);
};

/**
 * Recursive parser and evaluator for boolean logic.
 * Supports: AND, OR, NOT, IMPLIES, IFF, Parens
 */
const evaluateTokens = (tokens: string[], values: Record<string, boolean>): boolean => {
  let pos = 0;

  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  const parseAtom = (): boolean => {
    const token = consume();
    if (!token) return false;

    if (token === '(') {
      const val = parseIff();
      consume(); // consume ')'
      return val;
    }
    if (token === 'NOT' || token === '!') {
      return !parseAtom();
    }
    if (token === 'TRUE') return true;
    if (token === 'FALSE') return false;
    
    // Variable lookup
    return !!values[token];
  };

  const parseAnd = (): boolean => {
    let left = parseAtom();
    while (peek() === 'AND' || peek() === '&&') {
      consume();
      const right = parseAtom();
      left = left && right;
    }
    return left;
  };

  const parseOr = (): boolean => {
    let left = parseAnd();
    while (peek() === 'OR' || peek() === '||') {
      consume();
      const right = parseAnd();
      left = left || right;
    }
    return left;
  };

  const parseImplies = (): boolean => {
    let left = parseOr();
    while (peek() === 'IMPLIES' || peek() === '→') {
      consume();
      const right = parseOr(); 
      // A -> B is !A || B
      left = (!left) || right; 
    }
    return left;
  };

  const parseIff = (): boolean => {
    let left = parseImplies();
    while (peek() === 'IFF' || peek() === '↔') {
      consume();
      const right = parseImplies();
      // A <-> B is A === B
      left = (left === right);
    }
    return left;
  };

  return parseIff();
};

/**
 * Checks if two boolean expressions are logically equivalent by brute-forcing their Truth Table.
 */
export const areExpressionsEquivalent = (expr1: string, expr2: string, variables: string[]): boolean => {
  try {
    const tokens1 = tokenize(expr1);
    const tokens2 = tokenize(expr2);

    if (tokens1.length === 0 || tokens2.length === 0) return false;

    // Calculate 2^n combinations
    const combinations = 1 << variables.length;

    for (let i = 0; i < combinations; i++) {
      const currentValues: Record<string, boolean> = {};
      for (let v = 0; v < variables.length; v++) {
        // Extract bit v from integer i
        currentValues[variables[v]] = !!((i >> v) & 1);
      }

      const res1 = evaluateTokens([...tokens1], currentValues);
      const res2 = evaluateTokens([...tokens2], currentValues);

      if (res1 !== res2) {
        return false;
      }
    }

    return true;
  } catch (e) {
    console.error("Logic Error:", e);
    return false;
  }
};

/**
 * Calculates a simple heuristic complexity score.
 * Lower is better.
 */
export const getComplexityScore = (expr: string): number => {
    if (!expr) return 999;
    
    // Tokenize first to avoid counting substring matches (e.g., 'AND' inside a variable name if we had long vars)
    // Though vars are single letter P,Q... so regex is fine.
    
    // Count Variables + Operators
    const matches = expr.match(/[PQRST]|∧|∨|¬|→|↔|AND|OR|NOT/gi);
    return matches ? matches.length : 0;
};