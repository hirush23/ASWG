import { Wallet, LogOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet, truncateAddress } from "@/lib/wallet";

export function WalletButton() {
  const { isConnected, address, isPolygon, isConnecting, connect, disconnect, switchToPolygon } =
    useWallet();

  if (!isConnected) {
    return (
      <Button
        onClick={connect}
        disabled={isConnecting}
        className="gap-2"
        data-testid="button-connect-wallet"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
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
