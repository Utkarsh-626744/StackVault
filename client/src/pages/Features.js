import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, CubeTransparentIcon, CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Features = () => {
  const features = [
    { icon: ShieldCheckIcon, title: "Secure Lending", description: "State-of-the-art security protocols to protect your assets" },
    { icon: CubeTransparentIcon, title: "Cross-Chain Compatibility", description: "Seamlessly lend and borrow across multiple blockchains" },
    { icon: CurrencyDollarIcon, title: "Competitive Rates", description: "Get the best lending and borrowing rates in the market" },
    { icon: ChartBarIcon, title: "Advanced Analytics", description: "In-depth insights into your lending and borrowing activities" }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1 
        className="text-5xl font-bold mb-8 neon-text text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        FEATURES
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="gradient-border glass-effect p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <feature.icon className="h-12 w-12 text-cyan-400 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-cyan-400 text">{feature.title}</h2>
            <p className="text-gray-300">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Features;