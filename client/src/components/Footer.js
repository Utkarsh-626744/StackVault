import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black bg-opacity-50 text-cyan-300 py-4 mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <p className="mb-2">Built with ❤️ by Utkarsh</p>
        <div className="flex space-x-4">
          <a href="https://github.com/Utkarsh-626744" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
            <FaGithub size={24} />
          </a>
          <a href="https://linkedin.com/in/utkarsh-6a8013201/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
            <FaLinkedin size={24} />
          </a>
          <a href="https://x.com/0xUtKar5h" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
            <FaTwitter size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;