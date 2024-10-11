import React, { createContext, useState, useEffect, useContext } from 'react';
import { AptosClient } from "aptos";
import { NODE_URL, FULL_MODULE_NAME, COLLECTION_NAME } from '../config';
import { useWallet } from './WalletContext';

const AptosContext = createContext();

export const AptosProvider = ({ children }) => {
  const { account } = useWallet();
  const [client] = useState(new AptosClient(NODE_URL));
  const [balance, setBalance] = useState(0);
  const [collectionExists, setCollectionExists] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (account) {
      updateBalance();
      checkCollectionExists();
    }
  }, [account]);

  const updateBalance = async () => {
    if (!account) return;
    try {
      const resources = await client.getAccountResources(account);
      const accountResource = resources.find((r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
      setBalance(accountResource.data.coin.value);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setError("Failed to fetch balance. Please try again.");
    }
  };

  const checkCollectionExists = async () => {
    if (!account) return;
    try {
      await client.getAccountResource(
        account,
        `${FULL_MODULE_NAME}::${COLLECTION_NAME}`
      );
      setCollectionExists(true);
    } catch (error) {
      console.error("RealEstateCollection resource not found:", error);
      setCollectionExists(false);
    }
  };

  const getTokens = async () => {
    if (!account || !collectionExists) return [];
    try {
      console.log("Fetching tokens for account:", account);
      console.log("Using resource path:", `${FULL_MODULE_NAME}::${COLLECTION_NAME}`);
      
      const resource = await client.getAccountResource(
        account,
        `${FULL_MODULE_NAME}::${COLLECTION_NAME}`
      );
      
      console.log("Raw resource data:", resource.data);
      
      const tokens = resource.data.tokens.map(token => {
        console.log("Processing token:", token);
        return {
          ...token,
          asset_type: token.asset_type ? new TextDecoder().decode(new Uint8Array(token.asset_type)) : 'Not specified'
        };
      });
      
      console.log("Processed tokens:", tokens);
      return tokens;
    } catch (error) {
      console.error("Error fetching tokens:", error);
      setError("Failed to fetch tokens. Please try again.");
      return [];
    }
  };

  const clearError = () => setError(null);

  return (
    <AptosContext.Provider value={{
      client,
      balance,
      updateBalance,
      collectionExists,
      getTokens,
      error,
      clearError
    }}>
      {children}
    </AptosContext.Provider>
  );
};

export const useAptos = () => useContext(AptosContext);