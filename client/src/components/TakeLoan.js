import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAptos } from '../context/AptosContext';
import { FULL_MODULE_NAME } from '../config';
import { buildTransactionPayload } from '../utils/aptosUtils';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { BanknotesIcon, DocumentTextIcon, ChartBarIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Modal from './Modal'; // Assuming you have a Modal component

const TakeLoan = () => {
  const { wallet, account } = useWallet();
  const { client, updateBalance } = useAptos();
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [isLockingCollateral, setIsLockingCollateral] = useState(false);
  const [isTakingLoan, setIsTakingLoan] = useState(false)
  const [userNFTs, setUserNFTs] = useState([]);
  const [loanToValue, setLoanToValue] = useState(0);
  const [interestRate, setInterestRate] = useState(5); // Example interest rate
  const [showValuationModal, setShowValuationModal] = useState(false);
  
  const fetchUserNFTs = async () => {
    if (account && client) {
      try {
        const resource = await client.getAccountResource(
          account,
          `${FULL_MODULE_NAME}::RealEstateCollection`
        );
        setUserNFTs(resource.data.tokens);
        // Update selectedNFT if it exists in the new NFT list
        if (selectedNFT) {
          const updatedNFT = resource.data.tokens.find(nft => nft.id === selectedNFT.id);
          setSelectedNFT(updatedNFT || null);
        }
      } catch (error) {
        console.error("Error fetching user NFTs:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserNFTs();
  }, [account, client]);

  useEffect(() => {
    // Reset loan amount when selected NFT changes
    setLoanAmount('');
    setLoanToValue(0);
  }, [selectedNFT]);

  const lockCollateral = async () => {
    if (!wallet || !account || !selectedNFT) return;
    if (selectedNFT.locked_for_collateral) {
      toast.warn("This token is already locked for collateral.");
      return;
    }
    setIsLockingCollateral(true);

    const payload = buildTransactionPayload(
      `${FULL_MODULE_NAME}::lock_for_collateral`,
      [],
      [selectedNFT.id]
    );

    try {
      const response = await wallet.signAndSubmitTransaction({ payload });
      await client.waitForTransaction(response.hash);
      toast.success("Collateral locked successfully!");
      setShowValuationModal(true);
      
      // Update the selectedNFT state directly
      setSelectedNFT(prevNFT => ({
        ...prevNFT,
        locked_for_collateral: true
      }));
      
      // Refresh the full NFT list
      await fetchUserNFTs();
    } catch (error) {
      console.error("Error locking collateral:", error);
      toast.error(`Error locking collateral: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLockingCollateral(false);
    }
  };

  const takeLoan = async () => {
    if (!wallet || !account || !selectedNFT || !loanAmount) return;
    
    // Check if a loan has already been taken for this NFT
    if (selectedNFT.loan_amount && parseFloat(selectedNFT.loan_amount) > 0) {
      toast.error("A loan has already been taken for this NFT.");
      return;
    }
    
    // Check if the loan amount is less than the asset value
    if (parseFloat(loanAmount) >= parseFloat(selectedNFT.property_value)) {
      toast.error("Loan amount must be less than the asset value.");
      return;
    }
    
    setIsTakingLoan(true);

    const payload = buildTransactionPayload(
      `${FULL_MODULE_NAME}::take_loan`,
      [],
      [selectedNFT.id, loanAmount]
    );

    try {
      const response = await wallet.signAndSubmitTransaction({ payload });
      await client.waitForTransaction(response.hash);
      toast.success("Loan taken successfully!");
      updateBalance(account);
      setSelectedNFT(null);
      setLoanAmount('');
      // Refetch NFTs to update the state
      await fetchUserNFTs();
    } catch (error) {
      console.error("Error taking loan:", error);
      toast.error(`Error taking loan: ${error.message || 'Unknown error'}`);
    } finally {
      setIsTakingLoan(false);
    }
  };

  const calculateLoanToValue = (amount) => {
    if (selectedNFT) {
      const ltv = (amount / selectedNFT.property_value) * 100;
      setLoanToValue(Math.min(ltv, 80));
    }
  };

  const LoanStep = ({ number, title, children }) => (
    <li className="flex items-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center mr-3 mt-1">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-cyan-400">{title}</h3>
        <p className="text-gray-400">{children}</p>
      </div>
    </li>
  );

  return (
    <div className="flex flex-col space-y-6">
      <motion.div
        className="gradient-border glass-effect p-6 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-cyan-400 flex items-center mb-6 text">
          <BanknotesIcon className="h-8 w-8 mr-2" />
          Secure Loan Protocol
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
      <label htmlFor="nftSelect" className="block text-sm font-medium text-cyan-400 mb-2">
        Select NFT for Collateral
      </label>
      <select
        id="nftSelect"
        value={selectedNFT ? selectedNFT.id : ''}
        onChange={(e) => setSelectedNFT(userNFTs.find(nft => nft.id === e.target.value))}
        className="w-full px-4 py-3 bg-gray-800 text-cyan-400 border border-cyan-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
        disabled={isLockingCollateral || isTakingLoan}
      >
        <option value="">Select an NFT</option>
        {userNFTs.map((nft) => (
          <option key={nft.id} value={nft.id}>
            Token ID: {nft.id} - Value: {nft.property_value} APT 
            {nft.locked_for_collateral ? ' (Locked)' : ''}
            {nft.loan_amount && parseFloat(nft.loan_amount) > 0 ? ' (Loan Active)' : ''}
          </option>
        ))}
      </select>

      <motion.button 
        onClick={lockCollateral} 
        disabled={isLockingCollateral || isTakingLoan || !selectedNFT || selectedNFT.locked_for_collateral}
        className="cyberpunk-button w-full mt-4"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isLockingCollateral ? 'Processing...' : selectedNFT && selectedNFT.locked_for_collateral ? 'Already Locked' : 'Lock Collateral'}
      </motion.button>

      <div className="mt-4">
        <label htmlFor="loanAmount" className="block text-sm font-medium text-cyan-400 mb-2">
          Loan Amount (APT)
        </label>
        <input
          type="number"
          id="loanAmount"
          placeholder="Enter loan amount"
          value={loanAmount}
          onChange={(e) => {
            setLoanAmount(e.target.value);
            calculateLoanToValue(e.target.value);
          }}
          className="w-full px-4 py-3 bg-gray-800 text-cyan-400 border border-cyan-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          disabled={isTakingLoan || !selectedNFT || !selectedNFT.locked_for_collateral}
        />
      </div>

      <motion.button 
        onClick={takeLoan} 
        disabled={isTakingLoan || isLockingCollateral || !loanAmount || !selectedNFT || !selectedNFT.locked_for_collateral}
        className="cyberpunk-button w-full mt-4"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isTakingLoan ? 'Processing...' : 'Take Loan'}
      </motion.button>
    </div>
  
          <div className="space-y-6">
            {/* Loan Metrics */}
            <div className="bg-gray-800 rounded-lg p-4 border border-cyan-400">
              <h3 className="text-lg font-bold text-cyan-400 flex items-center mb-4 text">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Loan Metrics
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-400">Loan-to-Value (LTV) Ratio</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-700 rounded-full h-2 mr-2">
                      <div 
                        className="bg-cyan-400 h-2 rounded-full" 
                        style={{width: `${loanToValue}%`}}
                      ></div>
                    </div>
                    <span className="text-cyan-400 font-bold">{loanToValue.toFixed(2)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Interest Rate (APR)</p>
                  <p className="text-lg font-bold text-cyan-400">{interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Estimated Repayment</p>
                  <p className="text-lg font-bold text-cyan-400">
                    {loanAmount ? (parseFloat(loanAmount) * (1 + interestRate / 100)).toFixed(2) : '0'} APT
                  </p>
                </div>
              </div>
            </div>
  
            {/* Security Features */}
            <div className="bg-gray-800 rounded-lg p-4 border border-cyan-400">
              <h3 className="text-lg font-bold text-cyan-400 flex items-center mb-4">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Security Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <LockClosedIcon className="h-4 w-4 mr-2 text-cyan-400" />
                  Smart Contract Audited
                </li>
                <li className="flex items-center">
                  <LockClosedIcon className="h-4 w-4 mr-2 text-cyan-400" />
                  Multi-Sig Governance
                </li>
                <li className="flex items-center">
                  <LockClosedIcon className="h-4 w-4 mr-2 text-cyan-400" />
                  Collateral Lockup Mechanism
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
  
      {/* How to Take a Loan Steps */}
      <motion.div
        className="gradient-border glass-effect p-6 rounded-lg mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center mb-6">
          <DocumentTextIcon className="h-7 w-7 mr-2" />
          Steps to apply
        </h2>
        <ol className="space-y-4 text-gray-300">
          <LoanStep number={1} title="Select NFT">
            Choose an NFT from your collection to use as collateral.
          </LoanStep>
          <LoanStep number={2} title="Lock Collateral">
            Lock your selected NFT as collateral for the loan.
          </LoanStep>
          <LoanStep number={3} title="Enter Loan Amount">
            Specify the amount you wish to borrow against your collateral.
          </LoanStep>
          <LoanStep number={4} title="Review Terms">
            Carefully review the loan terms, including interest rate and repayment period.
            We are working with auditors on figuring out the fair value against your asset, this is an approximation.
          </LoanStep>
          <LoanStep number={5} title="Confirm and Sign">
            Confirm the transaction and sign it using your wallet.
          </LoanStep>
          <LoanStep number={6} title="Receive Funds">
            Once approved, the loan amount will be transferred to your wallet.
          </LoanStep>
        </ol>
      </motion.div>
  
      <div className="text-center text-gray-500 text-sm mt-6">
        <p>Always verify transaction details before signing</p>
      </div>
  
      <Modal isOpen={showValuationModal} onClose={() => setShowValuationModal(false)} title="Asset Valuation">
        <p>Asset valuation will be available soon. Our team is working on providing accurate valuations for your assets.</p>
      </Modal>
    </div>
  );

};

export default TakeLoan;