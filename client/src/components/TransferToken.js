import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAptos } from '../context/AptosContext';
import { FULL_MODULE_NAME } from '../config';
import { buildTransactionPayload } from '../utils/aptosUtils';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ArrowRightIcon, InformationCircleIcon, ShieldCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const TransferToken = () => {
  const { wallet, account } = useWallet();
  const { client, updateBalance } = useAptos();
  const [tokenId, setTokenId] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userNFTs, setUserNFTs] = useState([]);
  
  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (account && client) {
        try {
          const resource = await client.getAccountResource(
            account,
            `${FULL_MODULE_NAME}::RealEstateCollection`
          );
          setUserNFTs(resource.data.tokens);
        } catch (error) {
          console.error("Error fetching user NFTs:", error);
        }
      }
    };

    fetchUserNFTs();
  }, [account, client]);

  const transferToken = async () => {
    if (!wallet || !account || !tokenId || !recipientAddress) return;
    setIsLoading(true);

    const payload = buildTransactionPayload(
      `${FULL_MODULE_NAME}::transfer_token`,
      [],
      [recipientAddress, tokenId]
    );

    try {
      const pendingTransaction = await wallet.signAndSubmitTransaction(payload);
      await wallet.waitForTransaction(pendingTransaction.hash);
      toast.success("Token transferred successfully!");
      setTokenId('');
      setRecipientAddress('');
      updateBalance(account);
    } catch (error) {
      console.error("Error transferring token:", error);
      toast.error(`Error transferring token: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <motion.div
        className="gradient-border glass-effect p-6 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-cyan-400 flex items-center mb-6 text">
          <ArrowRightIcon className="h-8 w-8 mr-2" />
          Transfer Token
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="tokenId" className="block text-sm font-medium text-cyan-400 mb-2">
                Select Token
              </label>
              <select
                id="tokenId"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-cyan-400 border border-cyan-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                disabled={isLoading}
              >
                <option value="">Select a token</option>
                {userNFTs.map((nft) => (
                  <option key={nft.id} value={nft.id}>
                    Token ID: {nft.id} - Value: {nft.property_value} APT
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="recipientAddress" className="block text-sm font-medium text-cyan-400 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                id="recipientAddress"
                placeholder="Enter recipient address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-cyan-400 border border-cyan-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                disabled={isLoading}
              />
            </div>
            <motion.button 
              onClick={transferToken} 
              disabled={isLoading || !tokenId || !recipientAddress}
              className="cyberpunk-button w-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? 'Transferring...' : 'Transfer Token'}
            </motion.button>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-cyan-400">
              <h3 className="text-lg font-semibold text-cyan-400 flex items-center mb-4 text">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Transfer Metrics
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-400">Estimated Gas Fee</p>
                  <p className="text-lg font-bold text-cyan-400">0.001 APT</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Network</p>
                  <p className="text-lg font-bold text-cyan-400">Aptos Mainnet</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-cyan-400">
              <h3 className="text-lg font-semibold text-cyan-400 flex items-center mb-4 text">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Security Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <InformationCircleIcon className="h-4 w-4 mr-2 text-cyan-400" />
                  Instant transfers on the Aptos blockchain
                </li>
                <li className="flex items-center">
                  <InformationCircleIcon className="h-4 w-4 mr-2 text-cyan-400" />
                  Low transaction fees
                </li>
                <li className="flex items-center">
                  <InformationCircleIcon className="h-4 w-4 mr-2 text-cyan-400" />
                  Secure and transparent
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
      <div className="text-center text-gray-500 text-sm">
        <p>Always verify transaction details before signing</p>
      </div>
    </div>
  );
};

export default TransferToken;