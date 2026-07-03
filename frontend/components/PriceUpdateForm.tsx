'use client';

import { useState, useEffect } from 'react';
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
  // Use Next.js rewrite proxy (/api) to avoid CORS and ngrok warning pages
  const API_URL = '/api';
  const [formData, setFormData] = useState<PriceFormData>({
    categoryA: '',
    categoryB: '',
    categoryC: '',
    categoryD: '',
    updateTime: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isFetchingPrevious, setIsFetchingPrevious] = useState(false);
  const [previousPrices, setPreviousPrices] = useState<{A?: number, B?: number, C?: number, D?: number}>({});
  const [remainingRooms, setRemainingRooms] = useState<{A?: number, B?: number, C?: number, D?: number}>({});

  const handleFetchPrevious = async (isManual = false) => {
    setIsFetchingPrevious(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const fetchUrl = backendUrl ? `${backendUrl}/price/previous` : `${API_URL}/price/previous`;
      const response = await fetch(fetchUrl, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch previous prices');
      }
      const data = await response.json();
      if (data.prices) {
        setFormData((prev) => ({
          ...prev,
          categoryA: (!isManual && prev.categoryA) ? prev.categoryA : (data.prices.A?.toString() || ''),
          categoryB: (!isManual && prev.categoryB) ? prev.categoryB : (data.prices.B?.toString() || ''),
          categoryC: (!isManual && prev.categoryC) ? prev.categoryC : (data.prices.C?.toString() || ''),
          categoryD: (!isManual && prev.categoryD) ? prev.categoryD : (data.prices.D?.toString() || ''),
        }));
        setPreviousPrices(data.prices);
        if (data.remaining) {
          setRemainingRooms(data.remaining);
        }
        if (isManual && typeof isManual === 'boolean') {
          alert("Successfully fetched previous day's prices and remaining rooms!");
        }
      } else {
        throw new Error('No price data returned');
      }
    } catch (error) {
      console.error('Error fetching previous prices:', error);
      if (isManual && typeof isManual === 'boolean') {
        alert('Failed to fetch previous day prices. Is the backend running?');
      }
    } finally {
      setIsFetchingPrevious(false);
    }
  };

  useEffect(() => {
    handleFetchPrevious(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/price/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          time: formData.updateTime,
          prices: {
            A: parseInt(formData.categoryA),
            B: parseInt(formData.categoryB),
            C: parseInt(formData.categoryC),
            D: parseInt(formData.categoryD),
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

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
    } catch (error) {
      console.error('Error updating prices:', error);
      alert('Failed to schedule price update. Is the backend running?');
    }
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
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="categoryA" className="text-sm font-semibold text-foreground">
              Deluxe Queen AC Room
            </label>
            {(previousPrices.A !== undefined || remainingRooms.A !== undefined) && (
              <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border">
                {previousPrices.A !== undefined && `Prev: ₹${previousPrices.A}`}
                {previousPrices.A !== undefined && remainingRooms.A !== undefined && ' | '}
                {remainingRooms.A !== undefined && `Remaining: ${remainingRooms.A} rooms`}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">₹</span>
            <input
              suppressHydrationWarning
              type="number"
              id="categoryA"
              name="categoryA"
              placeholder="Enter price"
              value={formData.categoryA}
              onChange={handleInputChange}
              required
              className="w-full pl-8 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Category B */}
        <div className="group">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="categoryB" className="text-sm font-semibold text-foreground">
              Standard Queen AC Room
            </label>
            {(previousPrices.B !== undefined || remainingRooms.B !== undefined) && (
              <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border">
                {previousPrices.B !== undefined && `Prev: ₹${previousPrices.B}`}
                {previousPrices.B !== undefined && remainingRooms.B !== undefined && ' | '}
                {remainingRooms.B !== undefined && `Remaining: ${remainingRooms.B} rooms`}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">₹</span>
            <input
              suppressHydrationWarning
              type="number"
              id="categoryB"
              name="categoryB"
              placeholder="Enter price"
              value={formData.categoryB}
              onChange={handleInputChange}
              required
              className="w-full pl-8 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Category C */}
        <div className="group">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="categoryC" className="text-sm font-semibold text-foreground">
              Single AC Room
            </label>
            {(previousPrices.C !== undefined || remainingRooms.C !== undefined) && (
              <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border">
                {previousPrices.C !== undefined && `Prev: ₹${previousPrices.C}`}
                {previousPrices.C !== undefined && remainingRooms.C !== undefined && ' | '}
                {remainingRooms.C !== undefined && `Remaining: ${remainingRooms.C} rooms`}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">₹</span>
            <input
              suppressHydrationWarning
              type="number"
              id="categoryC"
              name="categoryC"
              placeholder="Enter price"
              value={formData.categoryC}
              onChange={handleInputChange}
              required
              className="w-full pl-8 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Category D */}
        <div className="group">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="categoryD" className="text-sm font-semibold text-foreground">
              Single Non AC Room
            </label>
            {(previousPrices.D !== undefined || remainingRooms.D !== undefined) && (
              <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border">
                {previousPrices.D !== undefined && `Prev: ₹${previousPrices.D}`}
                {previousPrices.D !== undefined && remainingRooms.D !== undefined && ' | '}
                {remainingRooms.D !== undefined && `Remaining: ${remainingRooms.D} rooms`}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">₹</span>
            <input
              suppressHydrationWarning
              type="number"
              id="categoryD"
              name="categoryD"
              placeholder="Enter price"
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
            suppressHydrationWarning
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
        <div className="pt-6 flex flex-col sm:flex-row gap-4">
          <Button
            suppressHydrationWarning
            type="button"
            onClick={() => handleFetchPrevious(true)}
            disabled={isFetchingPrevious}
            variant="outline"
            className="flex-1 py-3 font-semibold rounded-lg border border-primary/50 text-primary hover:bg-primary/10 transition-all duration-300 transform hover:scale-105"
          >
            {isFetchingPrevious ? '⏳ Fetching Prices...' : '🔄 Fetch Previous Day\'s Prices'}
          </Button>
          <Button
            suppressHydrationWarning
            type="submit"
            disabled={submitted}
            className={`flex-1 py-3 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${buttonClass}`}
          >
            {buttonText}
          </Button>
        </div>
      </form>

      {/* Info Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-secondary mb-1">Deluxe Queen AC Room</div>
          <div className="text-xs text-muted-foreground">Category A</div>
        </div>
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-accent mb-1">Standard Queen AC Room</div>
          <div className="text-xs text-muted-foreground">Category B</div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-primary mb-1">Single AC Room</div>
          <div className="text-xs text-muted-foreground">Category C</div>
        </div>
        <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-secondary mb-1">Single Non AC Room</div>
          <div className="text-xs text-muted-foreground">Category D</div>
        </div>
      </div>
    </Card>
  );
}
