import { type Logger } from 'pino';
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import * as Rx from 'rxjs';
import {
  EquityRegistryPrivateStateId,
  EquityRegistryProviders,
  DeployedEquityRegistryContract,
  emptyState,
  UserAction,
  type DerivedState,
  type EquityRegistryPrivateState,
} from './common-types';
import { Counter, createPrivateState } from '@eddalabs/equity-registry-contract';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { PrivateStateProvider } from '@midnight-ntwrk/midnight-js-types';
import { CompiledContract } from '@midnight-ntwrk/compact-js';

// The deployed contract uses counter compiled assets
const equityRegistryCompiledContract = CompiledContract.make('counter', Counter.Contract).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(`${window.location.origin}/midnight/counter`),
);

export interface ContractControllerInterface {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Rx.Observable<DerivedState>;
  registerEquityStake: () => Promise<void>;
}

export class ContractController implements ContractControllerInterface {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Rx.Observable<DerivedState>;
  readonly privateStates$: Rx.Subject<EquityRegistryPrivateState>;
  readonly actions$: Rx.Subject<UserAction>;

  private constructor(
    public readonly contractPrivateStateId: typeof EquityRegistryPrivateStateId,
    public readonly deployedContract: DeployedEquityRegistryContract,
    public readonly providers: EquityRegistryProviders,
    private readonly logger: Logger,
  ) {
    const combine = (_acc: DerivedState, value: DerivedState): DerivedState => ({
      equityStakes: value.equityStakes,
      privateState: value.privateState,
      actions: value.actions,
    });

    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    this.actions$ = new Rx.Subject<UserAction>();
    this.privateStates$ = new Rx.Subject<EquityRegistryPrivateState>();

    this.state$ = Rx.combineLatest(
      [
        providers.publicDataProvider
          .contractStateObservable(this.deployedContractAddress, { type: 'all' })
          .pipe(Rx.map((contractState) => Counter.ledger(contractState.data))),
        Rx.concat(
          Rx.from(
            Rx.defer(() => providers.privateStateProvider.get(contractPrivateStateId) as Promise<EquityRegistryPrivateState>),
          ),
          this.privateStates$,
        ),
        Rx.concat(Rx.of<UserAction>({ registerStake: undefined }), this.actions$),
      ],
      (ledgerState, privateState, userActions) => ({
        equityStakes: ledgerState.round,
        privateState,
        actions: userActions,
      }),
    ).pipe(
      Rx.scan(combine, emptyState),
      Rx.retry({ delay: 500 }),
    );
  }

  /** Register an equity stake on-chain (calls the increment circuit under the hood) */
  async registerEquityStake(): Promise<void> {
    this.logger?.info('Registering equity stake');
    this.actions$.next({ registerStake: 'Registering equity stake on-chain...' });

    try {
      const txData = await this.deployedContract.callTx.increment();
      this.logger?.trace({
        registerStake: {
          message: 'Equity stake registered successfully',
          txHash: txData.public.txHash,
          blockHeight: txData.public.blockHeight,
        },
      });
      this.actions$.next({ registerStake: undefined });
    } catch (e) {
      this.actions$.next({ registerStake: undefined });
      throw e;
    }
  }

  static async deploy(
    contractPrivateStateId: typeof EquityRegistryPrivateStateId,
    providers: EquityRegistryProviders,
    logger: Logger,
  ): Promise<ContractController> {
    logger.info({
      deployContract: {
        action: 'Deploying equity registry contract',
        contractPrivateStateId,
      },
    });

    const deployedContract = await deployContract(providers, {
      compiledContract: equityRegistryCompiledContract,
      privateStateId: contractPrivateStateId,
      initialPrivateState: await ContractController.getPrivateState(contractPrivateStateId, providers.privateStateProvider),
    });

    logger.trace({
      contractDeployed: {
        action: 'Equity registry contract deployed',
        contractPrivateStateId,
        finalizedDeployTxData: deployedContract.deployTxData.public,
      },
    });

    return new ContractController(contractPrivateStateId, deployedContract, providers, logger);
  }

  static async join(
    contractPrivateStateId: typeof EquityRegistryPrivateStateId,
    providers: EquityRegistryProviders,
    contractAddress: ContractAddress,
    logger: Logger,
  ): Promise<ContractController> {
    logger.info({
      joinContract: {
        action: 'Joining equity registry contract',
        contractPrivateStateId,
        contractAddress,
      },
    });

    const deployedContract = await findDeployedContract(providers, {
      contractAddress,
      compiledContract: equityRegistryCompiledContract,
      privateStateId: contractPrivateStateId,
      initialPrivateState: await ContractController.getPrivateState(contractPrivateStateId, providers.privateStateProvider),
    });

    logger.trace({
      contractJoined: {
        action: 'Joined equity registry contract',
        contractPrivateStateId,
        finalizedDeployTxData: deployedContract.deployTxData.public,
      },
    });

    return new ContractController(contractPrivateStateId, deployedContract, providers, logger);
  }

  private static async getPrivateState(
    privateStateId: typeof EquityRegistryPrivateStateId,
    privateStateProvider: PrivateStateProvider<typeof EquityRegistryPrivateStateId, EquityRegistryPrivateState>,
  ): Promise<EquityRegistryPrivateState> {
    const existingPrivateState = await privateStateProvider.get(privateStateId);
    const initialState = await this.getOrCreateInitialPrivateState(privateStateId, privateStateProvider);
    return existingPrivateState ?? initialState;
  }

  static async getOrCreateInitialPrivateState(
    privateStateId: typeof EquityRegistryPrivateStateId,
    privateStateProvider: PrivateStateProvider<typeof EquityRegistryPrivateStateId, EquityRegistryPrivateState>,
  ): Promise<EquityRegistryPrivateState> {
    let state = await privateStateProvider.get(privateStateId);
    if (state === null) {
      state = createPrivateState(0);
      await privateStateProvider.set(privateStateId, state);
    }
    return state;
  }
}
