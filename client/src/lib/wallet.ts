import { useState, useEffect, useCallback } from "react";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      selectedAddress?: string;
      chainId?: string;
    };
  }
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isPolygon: boolean;
  isConnecting: boolean;
  hasWallet: boolean;
  error: string | null;
}

const POLYGON_CHAIN_ID = 137;
const POLYGON_TESTNET_CHAIN_ID = 80001;

export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isPolygon: false,
    isConnecting: false,
    hasWallet: typeof window !== 'undefined' && !!window.ethereum,
    error: null,
  });

  const checkConnection = useCallback(async () => {
    const hasWallet = typeof window !== 'undefined' && !!window.ethereum;
    if (!hasWallet) {
      setState((prev) => ({ ...prev, hasWallet: false, error: "No wallet detected" }));
      return;
    }
    setState((prev) => ({ ...prev, hasWallet: true }));

    try {
      const accounts = (await window.ethereum!.request({
        method: "eth_accounts",
      })) as string[];
      const chainId = (await window.ethereum!.request({
        method: "eth_chainId",
      })) as string;

      const chainIdNum = parseInt(chainId, 16);
      const isPolygon = chainIdNum === POLYGON_CHAIN_ID || chainIdNum === POLYGON_TESTNET_CHAIN_ID;

      if (accounts.length > 0) {
        setState({
          isConnected: true,
          address: accounts[0],
          chainId: chainIdNum,
          isPolygon,
          isConnecting: false,
          hasWallet: true,
          error: null,
        });
      } else {
        setState({
          isConnected: false,
          address: null,
          chainId: null,
          isPolygon: false,
          isConnecting: false,
          hasWallet: true,
          error: null,
        });
      }
    } catch (error) {
      console.error("Error checking connection:", error);
      setState((prev) => ({
        ...prev,
        hasWallet: true,
        isConnecting: false,
        error: "Failed to check connection",
      }));
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState((prev) => ({ ...prev, error: "Please install MetaMask" }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      const chainId = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string;

      const chainIdNum = parseInt(chainId, 16);
      const isPolygon = chainIdNum === POLYGON_CHAIN_ID || chainIdNum === POLYGON_TESTNET_CHAIN_ID;

      if (accounts.length > 0) {
        setState({
          isConnected: true,
          address: accounts[0],
          chainId: chainIdNum,
          isPolygon,
          isConnecting: false,
          hasWallet: true,
          error: null,
        });
      } else {
        setState({
          isConnected: false,
          address: null,
          chainId: null,
          isPolygon: false,
          isConnecting: false,
          hasWallet: true,
          error: "No accounts available",
        });
      }
    } catch (error) {
      setState({
        isConnected: false,
        address: null,
        chainId: null,
        isPolygon: false,
        isConnecting: false,
        hasWallet: true,
        error: "Connection rejected",
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnected: false,
      address: null,
      chainId: null,
      isPolygon: false,
      isConnecting: false,
      error: null,
    }));
  }, []);

  const switchToPolygon = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }],
      });
    } catch (switchError: unknown) {
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x89",
                chainName: "Polygon Mainnet",
                nativeCurrency: {
                  name: "MATIC",
                  symbol: "MATIC",
                  decimals: 18,
                },
                rpcUrls: ["https://polygon-rpc.com/"],
                blockExplorerUrls: ["https://polygonscan.com/"],
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding Polygon network:", addError);
        }
      }
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: unknown) => {
        const accs = accounts as string[];
        if (accs.length === 0) {
          disconnect();
        } else {
          setState((prev) => ({ ...prev, address: accs[0] }));
        }
      };

      const handleChainChanged = (chainId: unknown) => {
        const chainIdNum = parseInt(chainId as string, 16);
        const isPolygon =
          chainIdNum === POLYGON_CHAIN_ID || chainIdNum === POLYGON_TESTNET_CHAIN_ID;
        setState((prev) => ({ ...prev, chainId: chainIdNum, isPolygon }));
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [checkConnection, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    switchToPolygon,
  };
}
