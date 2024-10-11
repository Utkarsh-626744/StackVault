import React from 'react';
import { useWallet } from '../context/WalletContext';
import { useAptos } from '../context/AptosContext';
import { UserCircleIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const AccountInfo = () => {
  const { account } = useWallet();
  const { balance } = useAptos();

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const generateAvatarSeed = (address) => {
    return parseInt(address.slice(2, 10), 16);
  };

  return (
    <motion.div 
      className="flex items-center space-x-4 gradient-border glass-effect p-4 rounded-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <img
        src={`https://avatars.dicebear.com/api/identicon/${generateAvatarSeed(account)}.svg`}
        alt="User Avatar"
        className="h-12 w-12 rounded-full border-2 border-cyan-400"
      />
      <div className="flex flex-col">
        <span className="font-medium text-cyan-400 text-sm neon-text">{shortenAddress(account)}</span>
        <span className="text-cyan-300 text-xs flex items-center">
          <CurrencyDollarIcon className="h-3 w-3 mr-1" />
          {balance} APT
        </span>
      </div>
    </motion.div>
  );
};

export default AccountInfo;