import React from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon, CommandLineIcon, QuestionMarkCircleIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

const Docs = () => {
  const docSections = [
    { icon: DocumentTextIcon, title: "API Reference", link: "#api-reference" },
    { icon: CommandLineIcon, title: "Integration Guide", link: "#integration-guide" },
    { icon: QuestionMarkCircleIcon, title: "FAQs", link: "#faqs" },
    { icon: RocketLaunchIcon, title: "Roadmap", link: "#roadmap" }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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

      <section id="api-reference" className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400">API Reference</h2>
        <div className="space-y-6">
          <APIEndpoint 
            method="POST" 
            endpoint="/api/mint-token" 
            description="Mint a new RWA token"
            parameters={[
              { name: "assetType", type: "string", description: "Type of the real-world asset" },
              { name: "propertyValue", type: "number", description: "Value of the asset in APT" },
              { name: "ipfsHash", type: "string", description: "IPFS hash of the asset image" }
            ]}
          />
          <APIEndpoint 
            method="POST" 
            endpoint="/api/take-loan" 
            description="Take a loan against a locked RWA token"
            parameters={[
              { name: "tokenId", type: "string", description: "ID of the locked RWA token" },
              { name: "loanAmount", type: "number", description: "Amount of loan requested in APT" }
            ]}
          />
          <APIEndpoint 
            method="POST" 
            endpoint="/api/repay-loan" 
            description="Repay a loan and unlock the collateral"
            parameters={[
              { name: "tokenId", type: "string", description: "ID of the RWA token used as collateral" },
              { name: "repayAmount", type: "number", description: "Amount to repay in APT" }
            ]}
          />
        </div>
      </section>

      <section id="integration-guide" className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400">Integration Guide</h2>
        <div className="space-y-4">
          <p className="text-gray-300">To integrate StackVault into your project, follow these steps:</p>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Install the StackVault SDK: <code className="bg-gray-800 px-2 py-1 rounded">npm install stackvault-sdk</code></li>
            <li>Import the SDK in your project: <code className="bg-gray-800 px-2 py-1 rounded">import StackVault from 'stackvault-sdk';</code></li>
            <li>Initialize the SDK with your API key: <code className="bg-gray-800 px-2 py-1 rounded">const stackvault = new StackVault('YOUR_API_KEY');</code></li>
            <li>Use the SDK methods to interact with StackVault, e.g., <code className="bg-gray-800 px-2 py-1 rounded">stackvault.mintToken(...);</code></li>
          </ol>
          <p className="text-gray-300">For more detailed information, check out our <a href="#" className="text-cyan-400 hover:underline">full integration documentation</a>.</p>
        </div>
      </section>

      <section id="faqs" className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <FAQItem 
            question="What types of real-world assets can be tokenized?" 
            answer="StackVault supports tokenization of various real-world assets, including real estate, vehicles, art, jewelry, and more. The platform is designed to be flexible and accommodate a wide range of asset types."
          />
          <FAQItem 
            question="How is the value of tokenized assets determined?" 
            answer="The initial value is proposed by the asset owner during the minting process. However, our team of auditors verifies and approves the valuation before the asset can be used as collateral for loans."
          />
          <FAQItem 
            question="What are the loan terms?" 
            answer="Loan terms vary depending on the value of the collateral and market conditions. Generally, users can borrow up to 70% of the asset's approved value. Interest rates and repayment periods are determined at the time of loan approval."
          />
        </div>
      </section>

      <section id="roadmap" className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400">Roadmap</h2>
        <div className="space-y-4">
          <p className="text-gray-300">Our team is constantly working to improve StackVault and add new features. Here's what we're planning for the future:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Cross-chain integration to support multiple blockchain networks</li>
            <li>Fractional ownership of tokenized assets</li>
            <li>Secondary market for trading RWA tokens</li>
            <li>Automated valuation system using AI and machine learning</li>
            <li>Integration with DeFi protocols for yield farming opportunities</li>
            <li>Mobile app for easier asset management and loan tracking</li>
            <li>Governance token for community-driven decision making</li>
          </ul>
          <p className="text-gray-300 mt-4">Stay tuned for updates and announcements as we work towards these exciting developments!</p>
        </div>
      </section>
    </div>
  );
};

const APIEndpoint = ({ method, endpoint, description, parameters }) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <div className="flex items-center mb-2">
      <span className={`text-sm font-bold mr-2 px-2 py-1 rounded ${method === 'GET' ? 'bg-green-500' : 'bg-blue-500'}`}>{method}</span>
      <code className="text-cyan-400">{endpoint}</code>
    </div>
    <p className="text-gray-300 mb-2">{description}</p>
    <h4 className="text-sm font-bold text-gray-400 mb-1">Parameters:</h4>
    <ul className="list-disc list-inside text-sm text-gray-300">
      {parameters.map((param, index) => (
        <li key={index}><code className="text-cyan-400">{param.name}</code> ({param.type}): {param.description}</li>
      ))}
    </ul>
  </div>
);

const FAQItem = ({ question, answer }) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <h3 className="text-xl font-bold text-cyan-400 mb-2">{question}</h3>
    <p className="text-gray-300">{answer}</p>
  </div>
);

export default Docs;