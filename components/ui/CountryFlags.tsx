import React from 'react';

/**
 * Country flag components for language selection
 * These are simple SVG flags for Germany, Netherlands, France, and UK
 */

interface FlagProps {
  className?: string;
  width?: number;
  height?: number;
}

export const GermanyFlag: React.FC<FlagProps> = ({ className = '', width = 24, height = 16 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 5 3" 
    width={width} 
    height={height} 
    className={className}
  >
    <rect width="5" height="3" y="0" x="0" fill="#000"/>
    <rect width="5" height="2" y="1" x="0" fill="#D00"/>
    <rect width="5" height="1" y="2" x="0" fill="#FFCE00"/>
  </svg>
);

export const NetherlandsFlag: React.FC<FlagProps> = ({ className = '', width = 24, height = 16 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 9 6" 
    width={width} 
    height={height} 
    className={className}
  >
    <rect width="9" height="2" y="0" x="0" fill="#AE1C28"/>
    <rect width="9" height="2" y="2" x="0" fill="#FFF"/>
    <rect width="9" height="2" y="4" x="0" fill="#21468B"/>
  </svg>
);

export const FranceFlag: React.FC<FlagProps> = ({ className = '', width = 24, height = 16 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 3 2" 
    width={width} 
    height={height} 
    className={className}
  >
    <rect width="1" height="2" y="0" x="0" fill="#002395"/>
    <rect width="1" height="2" y="0" x="1" fill="#FFF"/>
    <rect width="1" height="2" y="0" x="2" fill="#ED2939"/>
  </svg>
);

export const UKFlag: React.FC<FlagProps> = ({ className = '', width = 24, height = 16 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 60 30" 
    width={width} 
    height={height} 
    className={className}
  >
    <clipPath id="a">
      <path d="M0 0v30h60V0z"/>
    </clipPath>
    <clipPath id="b">
      <path d="M30 15h30v15zv15H0zH0V0zV0h30z"/>
    </clipPath>
    <g clipPath="url(#a)">
      <path d="M0 0v30h60V0z" fill="#012169"/>
      <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/>
      <path d="M0 0l60 30m0-30L0 30" clipPath="url(#b)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

/**
 * Component that renders all country flags with links to their respective domains
 */
export const CountryFlags: React.FC = () => {
  return (
    <div className="flex items-center space-x-3">
      <a 
        href="https://dutchseedsupply.de" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-80 transition-opacity"
        title="German version"
      >
        <GermanyFlag />
      </a>
      <a 
        href="https://dutchseedsupply.nl" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-80 transition-opacity"
        title="Dutch version"
      >
        <NetherlandsFlag />
      </a>
      <a 
        href="https://dutchseedsupply.fr" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-80 transition-opacity"
        title="French version"
      >
        <FranceFlag />
      </a>
      <a 
        href="https://dutchseedsupply.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-80 transition-opacity"
        title="English version"
      >
        <UKFlag />
      </a>
    </div>
  );
};
