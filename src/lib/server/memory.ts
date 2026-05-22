// Memoria volátil del servidor para simulación de Paper Trading
export interface WalletState {
  asset: 'USDT' | 'BTC' | 'ETH' | string;
  balance: number;
}

export interface Operacion {
  accion: 'COMPRA' | 'VENTA';
  par: string;
  precio: number;
  cantidad: number;
  time: number;
  total: number;
}

// Uso de globalThis para preservar el estado entre recargas calientes en desarrollo local
const globalSymbols = global as any;

if (!globalSymbols.walletState) {
  globalSymbols.walletState = { asset: 'USDT', balance: 10000.00 };
}
if (!globalSymbols.operacionesState) {
  globalSymbols.operacionesState = [];
}

export const getWallet = (): WalletState => globalSymbols.walletState;

export const setWallet = (state: WalletState): void => {
  globalSymbols.walletState = state;
};

export const getOperaciones = (): Operacion[] => globalSymbols.operacionesState;

export const addOperacion = (op: Operacion): void => {
  globalSymbols.operacionesState.push(op);
  // Mantener solo las últimas 50
  if (globalSymbols.operacionesState.length > 50) {
    globalSymbols.operacionesState.shift();
  }
};
