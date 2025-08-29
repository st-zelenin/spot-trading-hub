export interface MigrateSymbolRequest {
  /**
   * The symbol to migrate from
   * @example "CYBERUSDT"
   */
  from: string;
  /**
   * The symbol to migrate to
   * @example "CYBERUSDC"
   */
  to: string;
}

export interface MigrationResult {
  /**
   * Number of orders that were processed during migration
   */
  ordersProcessed: number;
}
