import { DeployedProvider } from './equity-deployment';
import { LocalStorageProvider } from './equity-localStorage';
import { Provider } from './equity-providers';
import { Logger } from 'pino';
import { ContractAddress } from '@midnight-ntwrk/compact-runtime';

export * from './equity-providers';
export * from './equity-localStorage';
export * from './equity-localStorage-class';
export * from './equity-deployment';
export * from './equity-deployment-class';

interface AppProviderProps {
  children: React.ReactNode;
  logger: Logger;
  contractAddress: ContractAddress;
}

export const EquityRegistryAppProvider = ({ children, logger, contractAddress }: AppProviderProps) => {
  return (
    <LocalStorageProvider logger={logger}>
      <Provider logger={logger}>
        <DeployedProvider logger={logger} contractAddress={contractAddress}>
          {children}
        </DeployedProvider>
      </Provider>
    </LocalStorageProvider>
  );
};
