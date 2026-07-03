'use client';

import PriceUpdateForm from '@/components/PriceUpdateForm';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-8">
          <PriceUpdateForm />
        </div>
      </main>
    </div>
  );
}
