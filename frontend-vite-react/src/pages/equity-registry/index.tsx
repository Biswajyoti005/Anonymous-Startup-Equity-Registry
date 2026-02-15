import { Loading } from "@/components/loading";
import { useEffect, useState } from "react";
import { Shield, PlusCircle, CheckCircle, XCircle, FileText, Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { useContractSubscription } from "@/modules/midnight/equity-registry-sdk/hooks/use-contract-subscription";

export const EquityRegistry = () => {
  const { deployedContractAPI, derivedState, onDeploy, providers } =
    useContractSubscription();
  const [deployedAddress, setDeployedAddress] = useState<string | undefined>(undefined);
  const [appLoading, setAppLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (derivedState?.equityStakes !== undefined) {
      setAppLoading(false);
    }
  }, [derivedState?.equityStakes]);

  const deployNew = async () => {
    const { address } = await onDeploy();
    setDeployedAddress(address);
  };

  const registerStake = async () => {
    if (deployedContractAPI) {
      setIsRegistering(true);
      try {
        await deployedContractAPI.registerEquityStake();
      } finally {
        setIsRegistering(false);
      }
    }
  };

  const stakesExist = derivedState?.equityStakes !== undefined && derivedState.equityStakes > 0n;

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      {appLoading && <Loading />}
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-primary" />
              Equity Registry
            </h1>
            <p className="text-lg text-muted-foreground">
              Privacy-preserving cap table management on Midnight
            </p>
          </div>
          <div className="hidden md:block">
            <ModeToggle />
          </div>
        </div>

        {/* Main Contract Card */}
        <Card className="mb-8 border-primary/20">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Anonymous Startup Equity Registry</CardTitle>
            <CardDescription className="max-w-lg mx-auto text-base">
              Record equity ownership on-chain while keeping sensitive cap table
              information confidential from competitors using zero-knowledge proofs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={registerStake}
                  disabled={!deployedContractAPI || isRegistering}
                  className="gap-2 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>{isRegistering ? 'Registering...' : 'Register Equity Stake'}</span>
                </Button>
                <Button onClick={deployNew} variant="outline" className="gap-2" size="lg">
                  <FileText className="w-5 h-5" />
                  <span>Deploy New Registry</span>
                </Button>
              </div>

              {deployedAddress && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                    New Registry Deployed
                  </p>
                  <p className="text-sm font-mono break-all text-green-600 dark:text-green-300">
                    {deployedAddress}
                  </p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Total Equity Stakes</p>
                    </div>
                    <p className="text-3xl font-bold text-primary">
                      {derivedState?.equityStakes?.toString() || '0'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      {stakesExist ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <p className="text-sm font-medium text-muted-foreground">Stakes Verified</p>
                    </div>
                    <p className={`text-2xl font-bold ${stakesExist ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                      {stakesExist ? 'Yes' : 'No'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Private State</p>
                    </div>
                    <p className="text-2xl font-bold">
                      {derivedState?.privateState?.privateCounter?.toString() || '0'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                    </div>
                    <p className="text-sm font-mono break-all">
                      {derivedState?.actions?.registerStake || 'Idle'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Contract Address */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Connected Contract</p>
                  </div>
                  <p className="text-sm font-mono break-all">
                    {deployedContractAPI?.deployedContractAddress || 'Not connected — connect wallet first'}
                  </p>
                </CardContent>
              </Card>

              {/* Privacy Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Public On-Chain
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>Total number of equity stakes</li>
                      <li>Contract deployment address</li>
                      <li>Transaction existence & timestamps</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Private & Encrypted
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>Shareholder names & identities</li>
                      <li>Equity percentages & amounts</li>
                      <li>Vesting schedules & terms</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Flow Messages */}
              {providers?.flowMessage && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {providers.flowMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
