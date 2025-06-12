import React from 'react';

const VerifySbomCTA = () => {
  const handleVerifySbom = () => {
    console.log('Verify SBOM button clicked');
  };

  return (
    <div className="w-full p-6 text-center font-sans">
      <p className="mb-4 text-sm text-gray-600">
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        Click on "Verify SBOM" to attach an SBOM and initiate analysis to
        identify known vulnerabilities.
      </p>
      <button
        type="button"
        onClick={handleVerifySbom}
        disabled
        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-500 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Verify SBOM
      </button>
    </div>
  );
};

export default VerifySbomCTA;
