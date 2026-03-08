import React from 'react';

interface StickyFooterProps {
  children: React.ReactNode;
  className?: string;
}

const StickyFooter: React.FC<StickyFooterProps> = ({ children, className = '' }) => (
  <div className={`fixed bottom-0 left-0 right-0 z-40 ${className}`}>
    <div className="max-w-[430px] mx-auto">
      <div className="relative">
        <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        <div className="bg-background px-6 pb-8 pt-3">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export default StickyFooter;
