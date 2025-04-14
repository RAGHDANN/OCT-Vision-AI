import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Shield, Users, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Advanced OCT Scan Analysis with AI
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Detect retinal diseases early with our state-of-the-art deep learning system.
          Get instant, accurate diagnoses for DME, CNV, and Drusen.
        </p>
        <Link
          to="/signup"
          className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Brain className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
          <p className="text-gray-600">
            Advanced deep learning algorithms provide accurate disease detection and classification.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Shield className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
          <p className="text-gray-600">
            Your medical data is protected with enterprise-grade security and encryption.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Activity className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
          <p className="text-gray-600">
            Get detailed reports for both doctors and patients within seconds.
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Development Team</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((member) => (
            <div key={member} className="bg-white p-6 rounded-lg shadow-md">
              <img
                src={`https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop`}
                alt={`Team Member ${member}`}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-lg font-semibold">Dr. John Doe</h3>
              <p className="text-gray-600">AI Specialist</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}