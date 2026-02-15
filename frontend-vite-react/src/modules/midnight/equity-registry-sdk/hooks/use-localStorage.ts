import { useContext } from 'react';
import { LocalStorageContext } from '../contexts/equity-localStorage';
import { LocalStorageProps } from '../contexts/equity-localStorage-class';

export const useLocalState = (): LocalStorageProps => {
  const context = useContext(LocalStorageContext);

  if (!context) {
    throw new Error('useLocalState must be used within a LocalStorageProvider');
  }
  return context;
};
