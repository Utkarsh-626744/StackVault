import React from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon, CommandLineIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const Docs = () => {
  const docSections = [
    { icon: DocumentTextIcon, title: "API Reference", link: "#api-reference" },
    { icon: CommandLineIcon, title: "Integration Guide", link: "#integration-guide" },
    { icon: QuestionMarkCircleIcon, title: "FAQs", link: "#faqs" }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1 
        className="text-4xl font-bold mb-8 neon-text text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        DOCUMENTATION
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {docSections.map((section, index) => (
          <motion.a
            key={index}
            href={section.link}
            className="gradient-border glass-effect p-6 rounded-lg text-center hover:bg-opacity-70 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <section.icon className="h-16 w-16 text-cyan-400 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-cyan-400 text">{section.title}</h2>
          </motion.a>
        ))}
      </div>
      {/* Add more detailed documentation sections here */}
    </div>
  );
};

export default Docs;