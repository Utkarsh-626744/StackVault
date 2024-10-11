import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { HomeIcon, CurrencyDollarIcon, CreditCardIcon, ArrowsRightLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Footer from './Footer';
import StackVaultLOGO from '../assets/StackVaultLOGO.PNG';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-cyan-300 flex flex-col">
      <div className="animated-background">
        <div className="vault-door">
          <div className="vault-handle"></div>
        </div>
        <div className="grid-overlay"></div>
      </div>
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

const Header = () => {
  const { account, disconnect } = useWallet();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-black bg-opacity-50 p-4 border-b border-cyan-400">
      <div className="container mx-auto flex justify-between items-center">
      <Link to="/" className="flex items-center mr-60">
  <img src={StackVaultLOGO} alt="StackVault Logo" className="h-12 mr--50" /> {/* Increased size */}
  <span className="neon-text text-3xl font-bold">STACKVAULT</span>
</Link>
        <nav className="space-x-4">
          <Link to="/features" className={`${isActive('/features') ? 'text-cyan-400' : 'text-cyan-300'} hover:text-cyan-400 transition-colors duration-300`}>FEATURES</Link>
          <Link to="/products" className={`${isActive('/products') ? 'text-cyan-400' : 'text-cyan-300'} hover:text-cyan-400 transition-colors duration-300`}>PRODUCTS</Link>
          <Link to="/docs" className={`${isActive('/docs') ? 'text-cyan-400' : 'text-cyan-300'} hover:text-cyan-400 transition-colors duration-300`}>DOCS</Link>
        </nav>
        <div className="flex items-center space-x-4">
          {account ? (
            <>
              <span className="text-cyan-400">{account.slice(0, 6)}...{account.slice(-4)}</span>
              <motion.button 
                onClick={disconnect} 
                className="cyberpunk-button bg-red-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Disconnect
              </motion.button>
            </>
          ) : (
            <motion.button 
              className="cyberpunk-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              LAUNCH APP
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const sidebarItems = [
    { icon: HomeIcon, text: 'Home', path: '/' },
    { icon: CurrencyDollarIcon, text: 'Mint', path: '/mint' },
    { icon: CreditCardIcon, text: 'Loans', path: '/loan' },
    { icon: ArrowsRightLeftIcon, text: 'Transfer', path: '/transfer' },
  ];

  return (
    <div className="w-64 bg-black bg-opacity-50 p-6 border-r border-cyan-400">
      <nav className="space-y-4">
        {sidebarItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center space-x-2 ${location.pathname === item.path ? 'text-cyan-400' : 'text-cyan-300'} hover:text-cyan-400 transition-colors duration-300`}
          >
            <item.icon className="h-6 w-6" />
            <span>{item.text}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;