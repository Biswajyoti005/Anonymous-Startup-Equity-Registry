import { type EquityRegistryPrivateState, Counter, createPrivateState } from '@eddalabs/equity-registry-contract';
import type { ImpureCircuitId } from '@midnight-ntwrk/compact-js';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';

// Re-export for convenience
export type { EquityRegistryPrivateState };
export { createPrivateState };

// The deployed contract uses Counter.Contract under the hood
export type EquityRegistryCircuits = ImpureCircuitId<Counter.Contract<EquityRegistryPrivateState>>;

export const EquityRegistryPrivateStateId = 'equityRegistryPrivateState';

export type EquityRegistryProviders = MidnightProviders<EquityRegistryCircuits, typeof EquityRegistryPrivateStateId, EquityRegistryPrivateState>;

export type EquityRegistryContract = Counter.Contract<EquityRegistryPrivateState>;

export type DeployedEquityRegistryContract = DeployedContract<EquityRegistryContract> | FoundContract<EquityRegistryContract>;

export type UserAction = {
  registerStake: string | undefined;
};

export type DerivedState = {
  /** Total equity stakes registered (maps to contract's round/counter value) */
  readonly equityStakes: Counter.Ledger["round"];
  readonly privateState: EquityRegistryPrivateState;
  readonly actions: UserAction;
};

export const emptyState: DerivedState = {
  equityStakes: 0n,
  privateState: createPrivateState(0),
  actions: { registerStake: undefined },
};
