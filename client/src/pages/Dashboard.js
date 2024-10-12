import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useAptos } from '../context/AptosContext';
import { ArrowRightIcon, ClipboardDocumentCheckIcon, UserCircleIcon, LockClosedIcon, CurrencyDollarIcon, TagIcon } from '@heroicons/react/24/outline';
import HALO from 'vanta/dist/vanta.halo.min';
import * as THREE from 'three';
import '../styles/bg.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { account } = useWallet();
  const { client, getTokens } = useAptos();
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [userInfo, setUserInfo] = useState({
    lockedCollateral: 0,
    unlockedNFTs: 0,
    nftsAvailableForLoan: 0,
    loanTaken: 0,
  });

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        HALO({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          baseColor: 0x0a0a0a,
          backgroundColor: 0x0,
          amplitudeFactor: 1.50,
          xOffset: 0.23,
          yOffset: 0.04,
          size: 1.50,
          THREE
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect, isMounted]);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (account && client) {
        try {
          setIsLoading(true);
          const tokens = await getTokens();
          console.log("Fetched tokens:", tokens); // Debug log
          setNfts(tokens);
          updateUserInfo(tokens);
        } catch (error) {
          console.error("Error fetching NFTs:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchNFTs();
  }, [account, client, getTokens]);

  const updateUserInfo = (tokens) => {
    const lockedCollateral = tokens.filter(token => token.locked_for_collateral).length;
    const unlockedNFTs = tokens.filter(token => !token.locked_for_collateral).length;
    const numberOfLoansTaken = tokens.filter(token => parseFloat(token.loan_amount) > 0).length;
    const nftsAvailableForLoan = Math.max(lockedCollateral - numberOfLoansTaken, 0);
    const loanTaken = tokens.reduce((sum, token) => sum + (parseFloat(token.loan_amount) || 0), 0);
    
    setUserInfo({
      lockedCollateral,
      unlockedNFTs,
      nftsAvailableForLoan,
      loanTaken,
    });
    };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div ref={vantaRef} className="relative min-h-screen overflow-hidden bg-black">
      <div className="grid-background"></div>
      
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-1/2 z-10"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 right-0 w-full h-full">
          <path
            d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
            fill="none"
            stroke="#00FFFF"
            strokeWidth="0.5"
            strokeOpacity="0"
          >
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 100 100"
              to="360 100 100"
              dur="20s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </motion.div>

      <div className="relative z-20 container mx-auto px-4 py-12">
        <HeroSection />
        <MainActions />
        <Features />
        <UserInfoSection userInfo={userInfo} />
        <NFTTable nfts={nfts} />
        <BuildWithStackVault />
      </div>
    </div>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="text-center py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-cyan-400">
          STACKVAULT
        </h1>
        <p className="text-xl md:text-2xl font-bold text-green-300 mb-8">
          THE MOST UNIVERSAL NFT LENDING PROTOCOL
        </p>
        <p className="text-lg md:text-xl font-bold text-gray-400 mb-12">
          MINT NFTs AND TAKE CRYPTO BACKED LOANS TODAY
        </p>
        <div className="flex justify-center space-x-4">
          <Button text="MINT AN NFT" onClick={() => navigate('/mint')} />
        </div>
      </motion.div>
    </section>
  );
};

const Button = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-none text-lg transition duration-300 flex items-center"
  >
    {text}
    <ArrowRightIcon className="ml-2 h-5 w-5" />
  </button>
);


// const AnimatedBackground = () => (
//   <div className="absolute inset-0 z-0">
//     {[...Array(20)].map((_, i) => (
//       <motion.div
//         key={i}
//         className="absolute bg-cyan-500 rounded-full opacity-10"
//         style={{
//           width: Math.random() * 300 + 50,
//           height: Math.random() * 300 + 50,
//           top: `${Math.random() * 100}%`,
//           left: `${Math.random() * 100}%`,
//         }}
//         animate={{
//           scale: [1, 2, 2, 1, 1],
//           rotate: [0, 0, 270, 270, 0],
//           opacity: [0.1, 0.1, 0, 0.1, 0.1],
//           borderRadius: ["20%", "20%", "50%", "80%", "20%"],
//         }}
//         transition={{
//           duration: 12,
//           ease: "easeInOut",
//           times: [0, 0.2, 0.5, 0.8, 1],
//           repeat: Infinity,
//           repeatType: "reverse"
//         }}
//       />
//     ))}
//   </div>
// );

const MainActions = () => (
  <section className="py-20 px-4">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-cyan-400">
        EMPOWER YOUR NFT ASSETS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ActionCard title="MINT" description="Create NFTs from real-world assets" />
        <ActionCard title="LEND" description="Provide liquidity and earn interest" />
        <ActionCard title="BORROW" description="Get loans using your NFTs as collateral" />
        <ActionCard title="TRANSFER LOAN" description="Coming Soon...." />
      </div>
    </div>
  </section>
);

const ActionCard = ({ title, description, onClick }) => (
  <motion.div
    className="bg-gray-800 bg-opacity-50 rounded-xl p-6 shadow-lg border border-cyan-500 hover:border-cyan-400 transition duration-300 cursor-pointer"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
  >
    <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

const Features = () => (
  <section className="py-20 px-4 bg-gray-900 bg-opacity-50">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-cyan-400">
        WHY CHOOSE STACKVAULT
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard title="Secure" description="Built on Aptos blockchain" />
        <FeatureCard title="Flexible" description="Various collateral options" />
        <FeatureCard title="Efficient" description="Low fees and quick transactions" />
      </div>
    </div>
  </section>
);

const FeatureCard = ({ title, description }) => (
  <div className="text-center">
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

const BuildWithStackVault = () => {
  const navigate = useNavigate();
  return (
  <section className="py-20 px-4">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-cyan-400">
        BUILD WITH STACKVAULT
      </h2>
      <p className="text-xl text-gray-300 mb-12">
        Integrate StackVault into your projects and unlock new possibilities
      </p>
      <Button text="VIEW DOCS" onClick={() => navigate('/docs')} />
    </div>
  </section>
);
};
const UserInfoSection = ({ userInfo }) => (
  <section className="py-20 px-4">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-cyan-400 text">
        YOUR TRACK
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <InfoCard 
          icon={LockClosedIcon} 
          title="Locked Collateral" 
          value={userInfo.lockedCollateral} 
        />
        <InfoCard 
          icon={UserCircleIcon} 
          title="Unlocked NFTs" 
          value={userInfo.unlockedNFTs} 
        />
        <InfoCard 
          icon={ClipboardDocumentCheckIcon} 
          title="NFTs Available for Loan" 
          value={userInfo.nftsAvailableForLoan} 
        />
        <InfoCard 
          icon={CurrencyDollarIcon} 
          title="Loan Taken" 
          value={`${userInfo.loanTaken.toFixed(2)} APT`} 
        />
      </div>
    </div>
  </section>
);

const InfoCard = ({ icon: Icon, title, value }) => (
  <motion.div
    className="bg-gray-800 bg-opacity-50 rounded-xl p-6 shadow-lg border border-cyan-500 hover:border-cyan-400 transition duration-300"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon className="h-8 w-8 text-cyan-400 mb-4" />
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-2xl font-bold text-cyan-400">{value}</p>
  </motion.div>
);

const NFTTable = ({ nfts }) => {
  const decodeRWAType = (rwaTypeHex) => {
    if (!rwaTypeHex) return "Not specified";
    // Remove '0x' prefix if present
    const hex = rwaTypeHex.startsWith('0x') ? rwaTypeHex.slice(2) : rwaTypeHex;
    // Convert hex to bytes
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    // Decode bytes to string
    return new TextDecoder().decode(bytes);
  };

  return (
  <section className="py-20 px-4">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-cyan-400 text">
        YOUR NFTs
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-cyan-400">
              <th className="py-4 px-6 text-cyan-400">Token ID</th>
              <th className="py-4 px-6 text-cyan-400">Property Value</th>
              <th className="py-4 px-6 text-cyan-400">Asset Type</th>
              <th className="py-4 px-6 text-cyan-400">Status</th>
              <th className="py-4 px-6 text-cyan-400">Loan Amount</th>
            </tr>
          </thead>
          <tbody>
            {nfts.map((nft) => (
              <tr key={nft.id} className="border-b border-gray-700 hover:bg-gray-800 transition-colors duration-200">
                <td className="py-4 px-6 text-white">{nft.id}</td>
                <td className="py-4 px-6 text-cyan-400">{parseFloat(nft.property_value).toFixed(2)} APT</td>
                <td className="py-4 px-6 text-white">{decodeRWAType(nft.rwa_type)}</td>
                <td className="py-4 px-6 text-white">{nft.locked_for_collateral ? 'Locked' : 'Unlocked'}</td>
                <td className="py-4 px-6 text-cyan-400">{(parseFloat(nft.loan_amount) || 0).toFixed(2)} APT</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);
};

export default Dashboard;