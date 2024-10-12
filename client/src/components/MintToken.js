import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useAptos } from '../context/AptosContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { CurrencyDollarIcon, PhotoIcon, ArrowUpTrayIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { uploadFileToPinata } from '../utils/pinataUtils';
import { FULL_MODULE_NAME } from '../config';


const ImagePreview = ({ file }) => {
  const [preview, setPreview] = useState(null);

  React.useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [file]);

  if (!preview) return null;

  return (
    <div className="mt-4">
      <h3 className="text-xl font-bold mb-2 text-cyan-400">Preview:</h3>
      <img src={preview} alt="Preview" className="max-w-full h-auto rounded-lg" />
    </div>
  );
};

const MintToken = () => {
  const navigate = useNavigate();
  const { wallet, account } = useWallet();
  const { client, updateBalance } = useAptos();
  const [propertyValue, setPropertyValue] = useState('');
  const [assetType, setAssetType] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);


  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {'image/*': []},
    maxFiles: 1
  });

  const mintToken = async () => {
    if (!wallet || !account || !propertyValue || !file || !assetType ) {
      toast.error("Please fill in all fields and upload an image.");
      return;
    }
    setIsLoading(true);

    try {
      const ipfsHash = await uploadFileToPinata(file);
      const payload = {
        type: "entry_function_payload",
        function: `${FULL_MODULE_NAME}::mint_real_estate_token`,
        type_arguments: [],
        arguments: [propertyValue, Array.from(new TextEncoder().encode(ipfsHash)), Array.from(new TextEncoder().encode(assetType))]
      };

      const response = await wallet.signAndSubmitTransaction({ payload });
      await client.waitForTransaction(response.hash);
      toast.success("Token minted successfully!");
      navigate('/');
    } catch (error) {
      console.error("Error minting token:", error);
      toast.error(`Error minting token: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <h2 className="text-2xl font-bold mb-4 text">Step 1: Enter Asset Details</h2>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-gray-800 text-cyan-400 mb-4 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            >
              <option value="">Select RWA Type</option>
              <option value="real-estate">Real Estate</option>
              <option value="vehicle">Vehicle</option>
              <option value="art">Art</option>
              <option value="jewelry">Jewelry</option>
              <option value="other">Other</option>
            </select>
            
            <input
              type="number"
              placeholder="Enter Proposed value in APT"
              value={propertyValue}
              onChange={(e) => setPropertyValue(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-gray-800 text-cyan-400 mb-4 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            />
            <motion.button
              onClick={() => setStep(2)}
              disabled={!assetType || !propertyValue}
              className="cyberpunk-button w-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next
            </motion.button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <h2 className="text-2xl font-bold mb-4 text">Step 2: Upload Asset</h2>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed border-cyan-400 rounded-lg p-4 text-center cursor-pointer ${isDragActive ? 'bg-cyan-400 bg-opacity-10' : ''}`}
            >
              <input {...getInputProps()} />
              <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-cyan-400 mb-2" />
              <p className="text-cyan-400">Drag & drop a file here, or click to upload</p>
            </div>
            <ImagePreview file={file} />
            <div className="flex justify-between mt-4">
              <motion.button
                onClick={() => setStep(1)}
                className="cyberpunk-button bg-gray-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>
              <motion.button
                onClick={mintToken}
                disabled={isLoading || !file}
                className="cyberpunk-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? 'Minting...' : 'Mint Token'}
              </motion.button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.h1 
        className="text-4xl font-bold text-cyan-400 mb-8 text"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Mint Your Real World Asset
      </motion.h1>
      <div className="gradient-border glass-effect p-6 rounded-lg mb-8">
        {renderStep()}
      </div>
      <motion.div
        className="gradient-border glass-effect p-6 rounded-lg"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-cyan-400 flex items-center">
          <InformationCircleIcon className="h-6 w-6 mr-2" />
          Steps to Mint an NFT:
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-cyan-300">
          <li>Select the type of real-world asset you're minting.</li>
          <li>Enter the proposed value of your asset in APT.</li>
          <li>Specify the actual property value in APT.</li>
          <li>Upload a file representing your asset.</li>
          <li>Review the details and confirm the minting process.</li>
          <li>Sign the transaction with your connected wallet.</li>
          <li>Wait for the transaction to be confirmed on the blockchain.</li>
          <li>Our auditors team will verify the asset and approve your loan.</li>
        </ol>
      </motion.div>
    </div>
  );
};

export default MintToken;