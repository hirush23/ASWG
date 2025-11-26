import { Wallet, LogOut, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useWallet, truncateAddress } from "@/lib/wallet";

const walletOptions = [
  {
    name: "MetaMask",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    url: "https://metamask.io/download/",
    description: "Popular browser extension wallet",
  },
  {
    name: "Trust Wallet",
    icon: "https://trustwallet.com/assets/images/media/assets/trust_platform.svg",
    url: "https://trustwallet.com/download",
    description: "Mobile-first crypto wallet",
  },
  {
    name: "Coinbase Wallet",
    icon: "https://www.coinbase.com/favicon.ico",
    url: "https://www.coinbase.com/wallet/downloads",
    description: "Secure wallet by Coinbase",
  },
];

export function WalletButton() {
  const { isConnected, address, isPolygon, isConnecting, hasWallet, connect, disconnect, switchToPolygon } =
    useWallet();
  const [showWalletDialog, setShowWalletDialog] = useState(false);

  const handleConnect = () => {
    if (!hasWallet) {
      setShowWalletDialog(true);
    } else {
      connect();
    }
  };

  if (!isConnected) {
    return (
      <>
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="gap-2"
          data-testid="button-connect-wallet"
        >
          <Wallet className="h-4 w-4" />
          {isConnecting ? "Connecting..." : hasWallet ? "Connect Wallet" : "Install Wallet"}
        </Button>

        <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                No Wallet Detected
              </DialogTitle>
              <DialogDescription>
                To use Smart Wallet Guardian, you need a Web3 wallet installed in your browser. Choose one of the options below to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {walletOptions.map((wallet) => (
                <a
                  key={wallet.name}
                  href={wallet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <img 
                      src={wallet.icon} 
                      alt={wallet.name} 
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{wallet.name}</p>
                    <p className="text-sm text-muted-foreground">{wallet.description}</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              After installing a wallet, refresh this page and click "Connect Wallet" to continue.
            </p>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="button-wallet-menu">
          <div className="flex items-center gap-2">
            {isPolygon ? (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Polygon
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Wrong Network
              </Badge>
            )}
            <span className="font-mono text-sm">{truncateAddress(address || "")}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">Connected Wallet</p>
          <p className="text-xs text-muted-foreground font-mono">{address}</p>
        </div>
        <DropdownMenuSeparator />
        {!isPolygon && (
          <DropdownMenuItem onClick={switchToPolygon} data-testid="button-switch-network">
            <AlertTriangle className="mr-2 h-4 w-4 text-warning" />
            Switch to Polygon
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={disconnect} data-testid="button-disconnect">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
