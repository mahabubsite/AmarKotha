import React from 'react';
import { Shield, FileText, ArrowLeft } from 'lucide-react';

interface LegalContentProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
}

export const LegalContent: React.FC<LegalContentProps> = ({ type, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white min-h-screen">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      
      {type === 'privacy' ? (
        <div className="prose max-w-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-100 rounded-full">
               <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 m-0">Privacy Policy</h1>
          </div>
          <p className="text-gray-600 mb-4">Last updated: October 26, 2025</p>
          
          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">1. Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), delivery notes, and other information you choose to provide.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use the information we collect to provide, maintain, and improve our services, such as to:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-1">
             <li>Facilitate payments, send receipts, and provide customer support;</li>
             <li>Send you updates, security alerts, and administrative messages;</li>
             <li>Comply with legal obligations in Bangladesh.</li>
          </ul>
        </div>
      ) : (
        <div className="prose max-w-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
               <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 m-0">Terms of Service</h1>
          </div>
          <p className="text-gray-600 mb-4">Last updated: October 26, 2025</p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the services.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">2. User Conduct</h2>
          <p className="text-gray-700 mb-4">
            You agree not to use the platform to:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-1">
             <li>Violate any local, state, national, or international law;</li>
             <li>Harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability;</li>
             <li>Submit false or misleading information.</li>
          </ul>
        </div>
      )}
    </div>
  );
};