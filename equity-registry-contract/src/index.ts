export * as Counter from "./managed/counter/contract/index.js";
export * as EquityRegistry from "./managed/counter/contract/index.js";
export * as Voting from "./managed/voting/contract/index.js";

// Private state type matching the deployed counter contract
export type EquityRegistryPrivateState = { privateCounter: number };
export type CounterPrivateState = EquityRegistryPrivateState;

export function createPrivateState(value: number): EquityRegistryPrivateState {
  return { privateCounter: value };
}
