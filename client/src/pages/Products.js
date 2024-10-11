import React from 'react';
import { motion } from 'framer-motion';
import { BanknotesIcon, LockClosedIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

const Products = () => {
  const products = [
    { icon: BanknotesIcon, title: "Crypto-Backed Loans", description: "Get instant loans using your crypto as collateral" },
    { icon: LockClosedIcon, title: "Yield Farming", description: "Earn passive income by lending your crypto assets" },
    { icon: ArrowsRightLeftIcon, title: "Asset Swaps", description: "Easily swap between different crypto assets" }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1 
        className="text-4xl font-bold mb-8 neon-text text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        PRODUCTS
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product, index) => (
          <motion.div
            key={index}
            className="gradient-border glass-effect p-6 rounded-lg text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <product.icon className="h-16 w-16 text-cyan-400 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold mb-2 text-cyan-400 text">{product.title}</h2>
            <p className="text-gray-300">{product.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Products;