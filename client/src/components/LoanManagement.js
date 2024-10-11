import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAptos } from '../context/AptosContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FULL_MODULE_NAME } from '../config';

const LoanManagement = () => {
  const { wallet, account } = useWallet();
  const { client, updateBalance } = useAptos();
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, [account, client]);

  const fetchTokens = async () => {
    if (account && client) {
      try {
        const resource = await client.getAccountResource(
          account,
          `${FULL_MODULE_NAME}::RealEstateCollection`
        );
        setTokens(resource.data.tokens);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      }
    }
  };

  const lockCollateral = async () => {
    if (!selectedToken) return;
    setIsLoading(true);
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${FULL_MODULE_NAME}::lock_for_collateral`,
        type_arguments: [],
        arguments: [selectedToken.id]
      };
      const response = await wallet.signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);
      toast.success("Collateral locked successfully!");
      fetchTokens();
    } catch (error) {
      console.error("Error locking collateral:", error);
      toast.error(`Error locking collateral: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const unlockCollateral = async () => {
    if (!selectedToken) return;
    setIsLoading(true);
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${FULL_MODULE_NAME}::unlock_collateral`,
        type_arguments: [],
        arguments: [selectedToken.id]
      };
      const response = await wallet.signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);
      toast.success("Collateral unlocked successfully!");
      fetchTokens();
    } catch (error) {
      console.error("Error unlocking collateral:", error);
      toast.error(`Error unlocking collateral: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const takeLoan = async () => {
    if (!selectedToken || !loanAmount) return;
    setIsLoading(true);
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${FULL_MODULE_NAME}::take_loan`,
        type_arguments: [],
        arguments: [selectedToken.id, loanAmount]
      };
      const response = await wallet.signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);
      toast.success("Loan taken successfully!");
      fetchTokens();
    } catch (error) {
      console.error("Error taking loan:", error);
      toast.error(`Error taking loan: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const repayLoan = async () => {
    if (!selectedToken) return;
    setIsLoading(true);
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${FULL_MODULE_NAME}::repay_loan`,
        type_arguments: [],
        arguments: [selectedToken.id]
      };
      const response = await wallet.signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);
      toast.success("Loan repaid successfully!");
      fetchTokens();
    } catch (error) {
      console.error("Error repaying loan:", error);
      toast.error(`Error repaying loan: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-cyan-400 mb-8">Loan Management</h1>
      <div className="gradient-border glass-effect p-6 rounded-lg">
        <select
          value={selectedToken ? selectedToken.id : ''}
          onChange={(e) => setSelectedToken(tokens.find(t => t.id === parseInt(e.target.value)))}
          className="w-full px-4 py-2 rounded-md bg-gray-800 text-cyan-400 mb-4"
        >
          <option value="">Select a token</option>
          {tokens.map(token => (
            <option key={token.id} value={token.id}>
              Token ID: {token.id} - Value: {token.property_value} APT
              {token.locked_for_collateral ? ' (Locked)' : ''}
              {token.is_loan_active ? ` (Loan: ${token.loan_amount} APT)` : ''}
            </option>
          ))}
        </select>
        
        {selectedToken && (
          <div className="space-y-4">
            {!selectedToken.locked_for_collateral && (
              <motion.button
                onClick={lockCollateral}
                disabled={isLoading}
                className="cyberpunk-button w-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Lock Collateral
              </motion.button>
            )}
            
            {selectedToken.locked_for_collateral && !selectedToken.is_loan_active && (
              <>
                <motion.button
                  onClick={unlockCollateral}
                  disabled={isLoading}
                  className="cyberpunk-button w-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Unlock Collateral
                </motion.button>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="Enter loan amount"
                  className="w-full px-4 py-2 rounded-md bg-gray-800 text-cyan-400 mb-4"
                />
                <motion.button
                  onClick={takeLoan}
                  disabled={isLoading || !loanAmount}
                  className="cyberpunk-button w-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Take Loan
                </motion.button>
              </>
            )}
            
            {selectedToken.is_loan_active && (
              <motion.button
                onClick={repayLoan}
                disabled={isLoading}
                className="cyberpunk-button w-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Repay Loan
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanManagement;