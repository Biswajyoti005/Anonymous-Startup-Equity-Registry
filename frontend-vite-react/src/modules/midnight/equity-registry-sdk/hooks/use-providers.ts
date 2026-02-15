import { useContext } from 'react';
import { ProvidersContext, ProvidersState } from '../contexts';

export const useProviders = (): ProvidersState | null => {
  const providerState = useContext(ProvidersContext);
  if (!providerState) {
    console.warn('[useProviders] Equity registry providers not ready yet.');
    return null;
  }
  return providerState;
};
