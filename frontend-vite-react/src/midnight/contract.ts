/**
 * Contract Controller
 *
 * Manages the lifecycle of the Equity Registry smart contract:
 * - Join an existing deployed contract by address
 * - Subscribe to on-chain state updates
 * - Call contract circuits (registerEquityStake → increment)
 */

import type { ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Counter, createPrivateState } from '@eddalabs/equity-registry-contract';
import * as Rx from 'rxjs';
import type {
  EquityRegistryProviders,
  DeployedEquityRegistryContract,
  DerivedState,
  EquityRegistryPrivateState,
} from './types';
import { PRIVATE_STATE_ID } from './types';

// Compile the contract definition with assets from /public/midnight/counter/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const compiledContract = CompiledContract.make('counter', Counter.Contract as any).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(`${window.location.origin}/midnight/counter`),
);

export class ContractController {
  readonly contractAddress: ContractAddress;
  readonly state$: Rx.Observable<DerivedState>;

  private readonly actions$ = new Rx.Subject<string | undefined>();
  private readonly privateStates$ = new Rx.Subject<EquityRegistryPrivateState>();

  private constructor(
    private readonly contract: DeployedEquityRegistryContract,
    private readonly providers: EquityRegistryProviders,
  ) {
    this.contractAddress = contract.deployTxData.public.contractAddress;

    // Reactive state pipeline: combines ledger, private state, and action messages
    this.state$ = Rx.combineLatest([
      providers.publicDataProvider
        .contractStateObservable(this.contractAddress, { type: 'all' })
        .pipe(Rx.map((cs) => Counter.ledger(cs.data))),
      Rx.concat(
        Rx.defer(() =>
          providers.privateStateProvider.get(PRIVATE_STATE_ID) as Promise<EquityRegistryPrivateState>
        ),
        this.privateStates$,
      ),
      Rx.concat(Rx.of<string | undefined>(undefined), this.actions$),
    ]).pipe(
      Rx.map(([ledgerState, privateState, actionMessage]) => ({
        equityStakes: ledgerState.round,
        privateState: privateState ?? createPrivateState(0),
        actionMessage,
      })),
      Rx.retry({ delay: 500 }),
    );
  }

  /**
   * Join an already-deployed contract at the given address.
   */
  static async join(
    providers: EquityRegistryProviders,
    contractAddress: ContractAddress,
  ): Promise<ContractController> {
    // Ensure private state exists
    const existing = await providers.privateStateProvider.get(PRIVATE_STATE_ID);
    if (!existing) {
      await providers.privateStateProvider.set(PRIVATE_STATE_ID, createPrivateState(0));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contract = await findDeployedContract(providers as any, {
      contractAddress,
      compiledContract: compiledContract as any,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: existing ?? createPrivateState(0),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new ContractController(contract as any, providers);
  }

  /**
   * Register an equity stake by calling the increment circuit.
   */
  async registerEquityStake(): Promise<void> {
    this.actions$.next('Registering equity stake on-chain...');
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (this.contract as any).callTx.increment();
      this.actions$.next(undefined);
    } catch (err) {
      this.actions$.next(undefined);
      throw err;
    }
  }
}
