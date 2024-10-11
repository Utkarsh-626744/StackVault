import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAptos } from '../context/AptosContext';
import { DocumentDuplicateIcon, CurrencyDollarIcon, LockClosedIcon, CheckCircleIcon, TagIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { FULL_MODULE_NAME } from '../config';
import { getIPFSUrl } from '../utils/pinataUtils';

const UserTokens = () => {
  const { account } = useWallet();
  const { client } = useAptos();
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRepaidTokens, setShowRepaidTokens] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      if (account && client) {
        try {
          const resource = await client.getAccountResource(
            account,
            `${FULL_MODULE_NAME}::RealEstateCollection`
          );
          const fetchedTokens = resource.data.tokens;
          setTokens(fetchedTokens);
        } catch (error) {
          console.error("Error fetching tokens:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTokens();
  }, [account, client]);

  const filteredTokens = showRepaidTokens ? tokens : tokens.filter(token => !token.is_loan_repaid);

  return (
    <motion.div
      className="gradient-border glass-effect p-6 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center neon-text">
          <DocumentDuplicateIcon className="h-6 w-6 mr-2" />
          Your Tokens
        </h2>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={showRepaidTokens}
            onChange={() => setShowRepaidTokens(!showRepaidTokens)}
            className="form-checkbox h-5 w-5 text-cyan-400"
          />
          <span className="ml-2 text-cyan-300">Show Repaid Tokens</span>
        </label>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-cyan-300">Loading tokens...</p>
        ) : filteredTokens.length === 0 ? (
          <p className="text-cyan-300">No tokens to display.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTokens.map((token) => (
              <motion.div 
                key={token.id} 
                className={`bg-gray-800 p-4 rounded-lg border border-cyan-400 ${token.is_loan_repaid ? 'opacity-75' : ''}`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <img 
                  src={getIPFSUrl(token.ipfs_hash)} 
                  alt={`Token ${token.id}`} 
                  className="w-full h-48 object-cover rounded-md mb-2" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/path/to/fallback/image.jpg";
                  }}
                />
                <p className="text-cyan-400 font-bold">Token ID: {token.id}</p>
                <p className="text-cyan-300 flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                  Value: {token.property_value} APT
                </p>
                <p className="text-cyan-300 flex items-center">
                  <TagIcon className="h-4 w-4 mr-1" />
                  Type: {token.asset_type}
                </p>
                <p className="text-cyan-300 flex items-center">
                  <LockClosedIcon className="h-4 w-4 mr-1" />
                  {token.locked_for_collateral ? 'Locked' : 'Unlocked'}
                </p>
                {token.is_loan_repaid && (
                  <p className="text-green-400 flex items-center mt-2">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Loan Repaid
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UserTokens;