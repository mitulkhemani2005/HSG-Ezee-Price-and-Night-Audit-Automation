import React from 'react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground shadow-lg border-b border-primary/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🏨</div>
            <div>
              <h1 className="text-4xl font-bold text-white">Hotel Shreegopal</h1>
              <p className="text-primary-foreground/90 text-sm mt-1">Management Dashboard</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-foreground/80">Admin Panel</p>
            <p className="text-xs text-primary-foreground/60 mt-1">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
