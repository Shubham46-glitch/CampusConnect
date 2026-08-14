import React from 'react';

const Hero3DCanvas = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-3xl z-0">
      {/* Clean, minimal, premium ambient background radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-brand-500/10 via-indigo-500/10 to-sky-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[300px] bg-gradient-to-br from-indigo-500/10 to-brand-600/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
    </div>
  );
};

export default Hero3DCanvas;

