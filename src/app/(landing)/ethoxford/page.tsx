import React from 'react';

const Page = () => {
  return (
    <div className="container p-6 max-w-3xl mx-auto h-screen">
      <h1 className="text-3xl font-bold mb-4">AI Agents for DeFi & Cross-Chain Operations</h1>
      
      <section className="mb-6 mt-8">
        <p className="mt-2">Develop AI-powered agents that enhance DeFi operations and cross-chain interactions through natural language interfaces on Avalanche.</p>
        <p className="mt-2">The Avalanche Foundation offers a funding program for AI builders, with up to <strong>$15M</strong> in direct funding and retroactive grants.</p>
      </section>
      
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Potential Focus Areas</h3>
        <ul className="list-disc ml-6 mt-2 space-y-2">
          <li><strong>DeFi Position Management:</strong> Develop an AI agent to execute DeFi operations via natural language commands, managing yield farming, liquidity provision, and ensuring transaction safety.</li>
          <li><strong>Cross-Chain Migration Assistant:</strong> Create an AI-driven tool to automate asset movement across chains, optimizing for gas fees and execution efficiency.</li>
          <li><strong>Avalanche-Specific Agent Framework:</strong> Build a toolkit for launching AI agents optimized for Avalanche, including abstractions for key DeFi protocols.</li>
          <li><strong>Airdrop Farming Agents:</strong> Develop AI-powered agents to farm airdrops for new Avalanche Layer 1s.</li>
        </ul>
      </section>
      
      <section className="mb-6">
        <p className="text-sm text-gray-600">**Note:** All DeFi AI projects must integrate native Avalanche DeFi protocols such as YieldYak, GMX, Dexalot, Pharaoh, LFJ, etc.</p>
      </section>
    </div>
  );
};

export default Page;
