'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PriceFormData {
  categoryA: string;
  categoryB: string;
  categoryC: string;
  categoryD: string;
  updateTime: string;
}

export default function PriceUpdateForm() {
  const [formData, setFormData] = useState<PriceFormData>({
    categoryA: '',
    categoryB: '',
    categoryC: '',
    categoryD: '',
    updateTime: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Price Update Data:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        categoryA: '',
        categoryB: '',
        categoryC: '',
        categoryD: '',
        updateTime: '',
      });
    }, 2000);
  };

  const buttonText = submitted ? '✓ Prices Updated Successfully!' : 'Update All Prices';
  const buttonClass = submitted ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg';

  return (
    <Card className="p-8 bg-card shadow-lg border border-border">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Room Price Management</h2>
        <p className="text-muted-foreground">Update pricing for all room categories</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category A */}
        <div className="group">
          <label htmlFor="categoryA" className="block text-sm font-semibold text-foreground mb-2">
            Category A Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">₹</span>
            <input
              type="number"
              id="categoryA"
              name="categoryA"
              placeholder="Enter price (e.g., 2999)"
              value={formData.categoryA}
              onChange={handleInputChange}
              required
              className="w-full pl-8 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Category B */}
        <div className="group">
          <label htmlFor="categoryB" className="block text-sm font-semibold text-foreground mb-2">
            Category B Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">₹</span>
            <input
              type="number"
              id="categoryB"
              name="categoryB"
              placeholder="Enter price (e.g., 3499)"
              value={formData.categoryB}
              onChange={handleInputChange}
              required
              className="w-full pl-8 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Category C */}
        <div className="group">
          <label htmlFor="categoryC" className="block text-sm font-semibold text-foreground mb-2">
            Category C Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">₹</span>
            <input
              type="number"
              id="categoryC"
              name="categoryC"
              placeholder="Enter price (e.g., 3999)"
              value={formData.categoryC}
              onChange={handleInputChange}
              required
              className="w-full pl-8 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Category D */}
        <div className="group">
          <label htmlFor="categoryD" className="block text-sm font-semibold text-foreground mb-2">
            Category D Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">₹</span>
            <input
              type="number"
              id="categoryD"
              name="categoryD"
              placeholder="Enter price (e.g., 4499)"
              value={formData.categoryD}
              onChange={handleInputChange}
              required
              className="w-full pl-8 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Update Time */}
        <div className="group">
          <label htmlFor="updateTime" className="block text-sm font-semibold text-foreground mb-2">
            Time to Update Price
          </label>
          <input
            type="time"
            id="updateTime"
            name="updateTime"
            value={formData.updateTime}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-6 flex gap-4">
          <Button
            type="submit"
            className={`flex-1 py-3 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${buttonClass}`}
          >
            {buttonText}
          </Button>
        </div>
      </form>

      {/* Info Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-secondary mb-1">Category A</div>
          <div className="text-xs text-muted-foreground">Standard Room</div>
        </div>
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-accent mb-1">Category B</div>
          <div className="text-xs text-muted-foreground">Deluxe Room</div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">Category C</div>
          <div className="text-xs text-muted-foreground">Premium Room</div>
        </div>
        <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-secondary mb-1">Category D</div>
          <div className="text-xs text-muted-foreground">Suite Room</div>
        </div>
      </div>
    </Card>
  );
}
