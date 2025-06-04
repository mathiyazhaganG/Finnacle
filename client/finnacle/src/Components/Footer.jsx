import React from 'react';
import { Heart, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 w-full mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-white/80">
            © {currentYear} Finnacle. All rights reserved.
          </p>
          
          <div className="flex items-center">
            <span className="text-xs text-white/80">Built with</span>
            <Heart className="h-3 w-3 text-red-300 mx-1" fill="#fca5a5" />
            <span className="text-xs text-white/80 mr-1">by</span>
            <a 
              href="https://github.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center text-xs bg-white/10 hover:bg-white/20 text-white rounded-full px-2 py-1 transition-colors"
            >
              <Github className="h-3 w-3 mr-1" />
              Your Name
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;