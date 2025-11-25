import { initializeApp } from "firebase/app"
const firebaseConfig = {
  apiKey: "AIzaSyCzzWKZXpGFhuHUoJJCnp4fg5ZKYxzuuc4",
  authDomain: "calculator-12e0b.firebaseapp.com",
  projectId: "calculator-12e0b",
  storageBucket: "calculator-12e0b.firebasestorage.app",
  messagingSenderId: "666441788946",
  appId: "1:666441788946:web:17ce9ccdec0592db5d72cb"
};
const app = initializeApp(firebaseConfig);
import { getApps } from "firebase/app";

console.log("Firebase apps:", getApps()); // harus ada 1 app di array kalau berhasil
console.log("Firebase app name:", app.name);
import React, { useState, useMemo, FC, ChangeEvent } from 'react';

// --- Helper Functions & Type Definitions ---

const formatCurrency = (value: number): string => {
  if (isNaN(value)) {
    value = 0;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// --- SVG Icon Components (defined outside main component) ---

const TagIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 0v11a2 2 0 002 2h5a2 2 0 002-2v-5a2 2 0 00-2-2H7z" />
  </svg>
);

const CashIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TrendingUpIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const PriceTagIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
);

// --- Reusable UI Components (defined outside main component) ---

interface InputGroupProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: React.ReactNode;
}

const InputGroup: FC<InputGroupProps> = ({ label, value, onChange, placeholder, icon }) => (
  <div className="flex flex-col space-y-2">
    <label className="text-sm font-medium text-slate-300">{label}</label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {icon}
      </div>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-600 bg-slate-700 py-3 pl-10 pr-4 text-white placeholder-slate-400 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        min="0"
      />
    </div>
  </div>
);

interface ResultDisplayProps {
    label: string;
    value: string;
    description?: string;
}

const ResultDisplay: FC<ResultDisplayProps> = ({ label, value, description }) => (
    <div className="flex items-center justify-between rounded-lg bg-slate-800 p-4">
        <div>
            <p className="text-sm font-medium text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-cyan-400">{value}</p>
        </div>
        {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
);

interface CampaignCardProps {
  discount: number;
  originalPrice: number;
  finalPrice: number;
}

const CampaignCard: FC<CampaignCardProps> = ({ discount, originalPrice, finalPrice }) => {
  const discountAmount = originalPrice - finalPrice;

  return (
    <div className="transform rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-cyan-500/20">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Diskon {discount}%</h3>
        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-400">{discount}% OFF</span>
      </div>
      <p className="mt-2 text-sm text-slate-400">Harga setelah diskon:</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-white">{formatCurrency(finalPrice)}</p>
      {originalPrice > 0 && (
        <div className="mt-4 text-sm text-slate-500">
          <p>Dari <span className="line-through">{formatCurrency(originalPrice)}</span></p>
          <p className="text-emerald-400">Hemat {formatCurrency(discountAmount)}</p>
        </div>
      )}
    </div>
  );
};


// --- Main Application Component ---

const App: FC = () => {
  const [hpp, setHpp] = useState<string>('');
  const [profit, setProfit] = useState<string>('');
  const [campaignBasePrice, setCampaignBasePrice] = useState<string>('');

  const { hppValue, profitValue, campaignBasePriceValue } = useMemo(() => {
    return {
      hppValue: parseFloat(hpp) || 0,
      profitValue: parseFloat(profit) || 0,
      campaignBasePriceValue: parseFloat(campaignBasePrice) || 0,
    };
  }, [hpp, profit, campaignBasePrice]);

  const retailPrice = useMemo(() => hppValue + profitValue, [hppValue, profitValue]);

  const campaignPrices = useMemo(() => {
    return {
      discount5: campaignBasePriceValue * 0.95,
      discount10: campaignBasePriceValue * 0.90,
      discount15: campaignBasePriceValue * 0.85,
    };
  }, [campaignBasePriceValue]);

  return (
    <main className="min-h-screen w-full bg-slate-900 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/50 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Kalkulator Harga Jual</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
            Hitung harga jual produk Anda dengan mudah, termasuk keuntungan dan berbagai skenario diskon campaign.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Input Section */}
          <div className="flex flex-col space-y-6 rounded-2xl border border-slate-700 bg-slate-800/50 p-6 shadow-2xl backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white">Input Data</h2>
            <InputGroup
              label="HPP Produk (Harga Pokok Penjualan)"
              value={hpp}
              onChange={(e) => setHpp(e.target.value)}
              placeholder="Contoh: 50000"
              icon={<TagIcon className="h-5 w-5 text-slate-400" />}
            />
            <InputGroup
              label="Keuntungan (dalam Rupiah)"
              value={profit}
              onChange={(e) => setProfit(e.target.value)}
              placeholder="Contoh: 25000"
              icon={<TrendingUpIcon className="h-5 w-5 text-slate-400" />}
            />
            <InputGroup
              label="Harga Saat Daftar Campaign"
              value={campaignBasePrice}
              onChange={(e) => setCampaignBasePrice(e.target.value)}
              placeholder="Harga sebelum diskon"
              icon={<PriceTagIcon className="h-5 w-5 text-slate-400" />}
            />
          </div>

          {/* Results Section */}
          <div className="flex flex-col space-y-6">
             <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 shadow-2xl backdrop-blur-sm">
                 <h2 className="text-2xl font-bold text-white mb-4">Harga Etalase</h2>
                 <ResultDisplay 
                    label="HPP + Keuntungan"
                    value={formatCurrency(retailPrice)}
                 />
             </div>
             
             <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 shadow-2xl backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-4">Harga Campaign</h2>
                <div className="flex flex-col space-y-4">
                  <CampaignCard discount={5} originalPrice={campaignBasePriceValue} finalPrice={campaignPrices.discount5} />
                  <CampaignCard discount={10} originalPrice={campaignBasePriceValue} finalPrice={campaignPrices.discount10} />
                  <CampaignCard discount={15} originalPrice={campaignBasePriceValue} finalPrice={campaignPrices.discount15} />
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;
