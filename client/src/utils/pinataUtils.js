import axios from 'axios';
import { PINATA_JWT, PINATA_GATEWAY_URL } from '../config';

export const uploadFileToPinata = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxBodyLength: "Infinity",
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${PINATA_JWT}`
      }
    });

    console.log("Pinata upload response:", response.data);
    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
};

export const getIPFSUrl = (ipfsHash) => {
  // Remove '0x' prefix if present
  const cleanHash = ipfsHash.startsWith('0x') ? ipfsHash.slice(2) : ipfsHash;
  
  // Check if the hash is already in the correct format
  if (/^[a-zA-Z0-9]{46}$/.test(cleanHash)) {
    return `${PINATA_GATEWAY_URL}${cleanHash}`;
  }
  
  // Convert hex to UTF-8 string
  try {
    const bytes = new Uint8Array(cleanHash.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const decodedHash = new TextDecoder('utf-8').decode(bytes);
    return `${PINATA_GATEWAY_URL}${decodedHash}`;
  } catch (error) {
    console.error("Error decoding IPFS hash:", error);
    return null;
  }
};