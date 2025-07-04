import React from 'react';
import { Users } from 'lucide-react';

export function CollaborationRoom() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-slow" />
      
      {/* Floating circles decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center p-8 backdrop-blur-lg bg-gray-900/50 rounded-2xl border border-white/10 shadow-2xl max-w-2xl mx-4">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Users className="w-12 h-12 text-blue-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6">
          Coming Soon
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Our collaboration features are currently under development. We're crafting an amazing experience for teams to work together seamlessly.
        </p>
        <div className="flex justify-center items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-400 animate-bounce" />
          <div className="w-3 h-3 rounded-full bg-purple-400 animate-bounce delay-200" />
          <div className="w-3 h-3 rounded-full bg-pink-400 animate-bounce delay-400" />
        </div>
      </div>
    </div>
  );
}

export default CollaborationRoom; 