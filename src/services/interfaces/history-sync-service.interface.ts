export interface HistorySyncService {
  syncRecentSymbolHistory(symbol: string): Promise<void>;
  syncRecentHistory(): Promise<void>;
  syncFullHistory(symbol: string): Promise<void>;
}
