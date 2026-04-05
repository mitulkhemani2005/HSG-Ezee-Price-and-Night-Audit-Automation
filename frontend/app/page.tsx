'use client';

import { useState } from 'react';
import PriceUpdateForm from '@/components/PriceUpdateForm';
import NightUpdateForm from '@/components/NightUpdateForm';
import Header from '@/components/Header';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'price' | 'night'>('price');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            suppressHydrationWarning
            onClick={() => setActiveTab('price')}
            className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'price'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-card text-foreground border border-border hover:border-primary/50'
            }`}
          >
            💰 Price Update
          </button>
          <button
            suppressHydrationWarning
            onClick={() => setActiveTab('night')}
            className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'night'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-card text-foreground border border-border hover:border-primary/50'
            }`}
          >
            🌙 Night Update
          </button>
        </div>

        {/* Content Area */}
        <div className="grid gap-8">
          {activeTab === 'price' && <PriceUpdateForm />}
          {activeTab === 'night' && <NightUpdateForm />}
        </div>
      </main>
    </div>
  );
}
