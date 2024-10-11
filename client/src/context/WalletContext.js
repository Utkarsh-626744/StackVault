import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { NETWORK } from '../config';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [account, setAccount] = useState(null);
  const [walletStatus, setWalletStatus] = useState('loading');
  const [currentNetwork, setCurrentNetwork] = useState(null);

  const checkNetwork = useCallback(async (wallet) => {
    try {
      const networkResponse = await wallet.network();
      let networkName = typeof networkResponse === 'string' ? networkResponse : networkResponse?.name;
      networkName = networkName?.toLowerCase();
      setCurrentNetwork(networkName);
      return networkName === NETWORK.toLowerCase();
    } catch (error) {
      console.error("Error checking network:", error);
      return false;
    }
  }, []);

  const connectWallet = useCallback(async (wallet) => {
    try {
      const response = await wallet.connect();
      const isCorrectNetwork = await checkNetwork(wallet);
      if (!isCorrectNetwork) {
        setWalletStatus('wrong_network');
      } else {
        setAccount(response.address);
        setWalletStatus('connected');
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setWalletStatus('not_connected');
    }
  }, [checkNetwork]);

  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window.aptos !== 'undefined') {
        setWallet(window.aptos);
        setWalletStatus('not_connected');
        await connectWallet(window.aptos);
      } else {
        setWalletStatus('not_installed');
      }
    };

    checkWallet();
  }, [connectWallet]);

  const connect = async () => {
    if (wallet) {
      await connectWallet(wallet);
    }
  };

  const disconnect = async () => {
    if (wallet) {
      try {
        await wallet.disconnect();
        setAccount(null);
        setWalletStatus('not_connected');
      } catch (error) {
        console.error("Error disconnecting wallet:", error);
      }
    }
  };

  return (
    <WalletContext.Provider value={{ wallet, account, walletStatus, currentNetwork, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);