/**
 * Four Souls Online - Game Architecture Contracts (Future Phases)
 * 
 * Este archivo establece la estructura de tipos prevista para las fases posteriores
 * del juego de cartas. No contiene lógica activa en esta versión inicial.
 * 
 * Módulos previstos:
 * - Tablero (Board)
 * - Sistema de Turnos (Turn System)
 * - Cartas (Cards: Personaje, Tesoros, Botín, Monstruos)
 * - Combate (Combat)
 * - Dados (Dice Engine)
 * - Economía & Almas (Coins & Souls)
 * - Pila LIFO (LIFO Stack)
 * - Sistema de Prioridad (Priority System)
 */

export type CardType = 'character' | 'starting_item' | 'loot' | 'treasure' | 'monster' | 'room' | 'bonus_soul';

export interface Card {
  id: string;
  name: string;
  type: CardType;
  description: string;
  souls?: number;
  attack?: number;
  health?: number;
}

export interface PlayerGameState {
  playerId: string;
  coins: number;
  souls: number;
  currentHealth: number;
  maxHealth: number;
  attack: number;
  handCount: number;
}

export type TurnPhase = 
  | 'start_of_turn'
  | 'recharge'
  | 'draw'
  | 'action_phase'
  | 'end_of_turn';

export interface TurnState {
  activePlayerId: string;
  phase: TurnPhase;
  turnNumber: number;
  hasPlayedLootCard: boolean;
  hasPurchasedTreasure: boolean;
  hasDeclaredAttack: boolean;
}

export interface StackEffect {
  id: string;
  sourcePlayerId: string;
  sourceCardId?: string;
  description: string;
  resolved: boolean;
  createdAt: number;
}

/**
 * Pila LIFO (Last-In-First-Out)
 * Preparada para la resolución de efectos en cadena
 */
export interface GameStack {
  effects: StackEffect[];
}

export interface PriorityState {
  currentPriorityPlayerId: string;
  passedPlayers: string[];
}

export interface DiceRollResult {
  playerId: string;
  value: number; // 1 - 6
  modifier: number;
  finalValue: number;
  timestamp: number;
}

export interface BoardState {
  activeMonsters: Card[];
  activeTreasures: Card[];
  monsterDeckCount: number;
  treasureDeckCount: number;
  lootDeckCount: number;
}

export interface GameState {
  roomId: string;
  board: BoardState;
  turn: TurnState;
  stack: GameStack;
  priority: PriorityState;
  playerStates: Record<string, PlayerGameState>;
}
