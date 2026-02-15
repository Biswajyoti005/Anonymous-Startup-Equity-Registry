import { useContext } from 'react';
import { DeployedProviderContext, type DeployedAPIProvider } from '../contexts';

export const useDeployedContracts = (): DeployedAPIProvider => {
  const context = useContext(DeployedProviderContext);

  if (!context) {
    throw new Error('useDeployedContracts must be used within an EquityRegistryAppProvider');
  }

  return context;
};
