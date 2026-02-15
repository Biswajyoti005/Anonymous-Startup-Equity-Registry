/**
 * Midnight Wallet Types
 *
 * Types for the DApp Connector API v4.0.0 wallet integration.
 */

import type { ConnectedAPI, InitialAPI, Configuration, ConnectionStatus } from '@midnight-ntwrk/dapp-connector-api';
import type { ImpureCircuitId } from '@midnight-ntwrk/compact-js';
import type { MidnightProviders, PrivateStateProvider } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { EquityRegistryPrivateState, Counter } from '@eddalabs/equity-registry-contract';

// ── Wallet Types ────────────────────────────────────────────

export type WalletState = {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  initialAPI?: InitialAPI;
  connectedAPI?: ConnectedAPI;
  configuration?: Configuration;
  connectionStatus?: ConnectionStatus;
  dustAddress?: string;
  dustBalance?: { cap: bigint; balance: bigint };
  shieldedAddress?: string;
  shieldedCoinPublicKey?: string;
  shieldedEncryptionPublicKey?: string;
  shieldedBalances?: Record<string, bigint>;
  unshieldedAddress?: string;
  unshieldedBalances?: Record<string, bigint>;
  error?: string;
};

export type AvailableWallet = {
  name: string;
  rdns: string;
  apiVersion: string;
  icon?: string;
};

// ── Contract Types ──────────────────────────────────────────

export type { EquityRegistryPrivateState };

export type EquityRegistryCircuits = ImpureCircuitId<Counter.Contract<EquityRegistryPrivateState>>;

export const PRIVATE_STATE_ID = 'equityRegistryPrivateState' as const;

export type EquityRegistryProviders = MidnightProviders<
  EquityRegistryCircuits,
  typeof PRIVATE_STATE_ID,
  EquityRegistryPrivateState
>;

export type EquityRegistryContract = Counter.Contract<EquityRegistryPrivateState>;

export type DeployedEquityRegistryContract =
  | DeployedContract<EquityRegistryContract>
  | FoundContract<EquityRegistryContract>;

// ── Derived State ───────────────────────────────────────────

export type DerivedState = {
  readonly equityStakes: bigint;
  readonly privateState: EquityRegistryPrivateState;
  readonly actionMessage?: string;
};

// ── Provider Action Messages ────────────────────────────────

export type ProviderAction =
  | 'proveTxStarted' | 'proveTxDone'
  | 'downloadProverStarted' | 'downloadProverDone'
  | 'submitTxStarted' | 'submitTxDone'
  | 'watchForTxDataStarted' | 'watchForTxDataDone';

export const ACTION_MESSAGES: Record<ProviderAction, string | undefined> = {
  proveTxStarted: 'Generating zero-knowledge proof...',
  proveTxDone: undefined,
  downloadProverStarted: 'Downloading prover key...',
  downloadProverDone: undefined,
  submitTxStarted: 'Submitting transaction to blockchain...',
  submitTxDone: undefined,
  watchForTxDataStarted: 'Waiting for transaction finalization...',
  watchForTxDataDone: undefined,
};
