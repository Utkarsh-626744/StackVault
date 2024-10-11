import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './context/WalletContext';
import { AptosProvider } from './context/AptosContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import { motion } from 'framer-motion';
import StackVaultLOGO from './assets/StackVaultLOGO.PNG'; // Adjust the path as needed


import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Features from './pages/Features';
import Products from './pages/Products';
import Docs from './pages/Docs';
import MintToken from './components/MintToken';
import TakeLoan from './components/TakeLoan';
import TransferToken from './components/TransferToken';

function AppContent() {
  const { walletStatus, connect } = useWallet();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Modal.setAppElement('#root');
    // Simulate app initialization
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-32 h-32 border-t-4 border-b-4 border-cyan-400 rounded-full animate-spin"></div>
        </motion.div>
      </div>
    );
  }

  if (walletStatus !== 'connected') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center p-4">
        <div className="animated-background">
          <div className="vault-door">
            <div className="vault-handle"></div>
          </div>
          <div className="grid-overlay"></div>
        </div>
        <img src={StackVaultLOGO} alt="StackVault Logo" className="h-35 mb-5 mx-auto" />
        <motion.h1 
          className="text-5xl font-bold mb-8 neon-text"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to StackVault
        </motion.h1>
        {walletStatus === 'loading' ? (
          <div className="text-2xl font-bold animate-pulse neon-text">Loading...</div>
        ) : walletStatus === 'not_installed' ? (
          <motion.a 
            href="https://petra.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="cyberpunk-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Install Petra Wallet
          </motion.a>
        ) : (
          <motion.button 
            onClick={connect} 
            className="cyberpunk-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Connect Wallet
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <AptosProvider>
      <Router>
        <div className="animated-background">
        <div className="full-page-grid">
          <div className="grid-container"></div>
        </div>
        </div>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mint" element={<MintToken />} />
            <Route path="/loan" element={<TakeLoan />} />
            <Route path="/transfer" element={<TransferToken />} />
            <Route path="/features" element={<Features />} />
            <Route path="/products" element={<Products />} />
            <Route path="/docs" element={<Docs />} />
          </Routes>
        </Layout>
        <ToastContainer position="bottom-right" theme="dark" />
      </Router>
    </AptosProvider>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}