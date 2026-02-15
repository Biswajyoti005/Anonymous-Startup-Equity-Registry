import type { Logger } from 'pino';

export interface LocalStorageProps {
  readonly addContract: (contract: string) => void;
  readonly getContracts: () => string[];
}

export class LocalStorage implements LocalStorageProps {
  constructor(private readonly logger: Logger) {}

  addContract(contract: string): void {
    this.logger.trace(`Adding equity registry contract ${contract}`);
    const item = window.localStorage.getItem('equity_registry_contracts');
    const contracts: string[] = item ? JSON.parse(item) : [];
    const updatedContracts = Array.from(new Set([...contracts, contract]));
    window.localStorage.setItem('equity_registry_contracts', JSON.stringify(updatedContracts));
  }

  getContracts(): string[] {
    const item = window.localStorage.getItem('equity_registry_contracts');
    const contracts: string[] = item ? JSON.parse(item) : [];
    return Array.from<string>(new Set([...contracts]));
  }
}
