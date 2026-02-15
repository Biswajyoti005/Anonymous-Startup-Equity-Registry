import { DerivedState } from "../api/common-types";
import { useCallback, useEffect, useState } from "react";
import { ContractControllerInterface } from "../api/contractController";
import { Observable } from "rxjs";
import { useWallet } from "../../wallet-widget/hooks/useWallet";
import { ContractDeployment, ContractFollow } from "../contexts";
import { useDeployedContracts } from "./use-deployment";
import { useProviders } from "./use-providers";

export const useContractSubscription = () => {
  const { status } = useWallet();
  const providers = useProviders();
  const deploy = useDeployedContracts();

  const [deploymentObservable, setDeploymentObservable] =
    useState<Observable<ContractDeployment> | undefined>(undefined);

  const [contractDeployment, setContractDeployment] =
    useState<ContractDeployment>();
  const [deployedContractAPI, setDeployedContractAPI] =
    useState<ContractControllerInterface>();
  const [derivedState, setDerivedState] = useState<DerivedState>();

  const onDeploy = async (): Promise<ContractFollow> => {
    const contractFollow = await deploy.deployContract();
    return contractFollow;
  };

  const onJoin = useCallback(async (): Promise<void> => {
    setDeploymentObservable(deploy.joinContract().observable);
  }, [deploy, setDeploymentObservable]);

  useEffect(() => {
    if (status?.status === "connected" && providers) {
      void onJoin();
    }
  }, [onJoin, status?.status, providers]);

  useEffect(() => {
    if (!deploymentObservable) return;
    const subscription = deploymentObservable.subscribe(setContractDeployment);
    return () => { subscription.unsubscribe(); };
  }, [deploymentObservable]);

  useEffect(() => {
    if (!contractDeployment) return;
    if (contractDeployment.status === "in-progress" || contractDeployment.status === "failed") return;
    setDeployedContractAPI((prev) => prev || contractDeployment.api);
  }, [contractDeployment, setDeployedContractAPI]);

  useEffect(() => {
    if (deployedContractAPI) {
      const subscription = deployedContractAPI.state$.subscribe(setDerivedState);
      return () => { subscription.unsubscribe(); };
    }
  }, [deployedContractAPI]);

  return {
    deployedContractAPI,
    derivedState,
    onDeploy,
    providers,
  };
};
