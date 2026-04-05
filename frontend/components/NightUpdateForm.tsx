'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NightFormData {
  updateTime: string;
}

export default function NightUpdateForm() {
  const [formData, setFormData] = useState<NightFormData>({
    updateTime: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');

  useEffect(() => {
    const fetchAuditTime = async () => {
      try {
        const response = await fetch('http://localhost:8000/audit/time');
        if (response.ok) {
          const data = await response.json();
          if (data.time) {
            setSelectedTime(data.time);
            setFormData({ updateTime: data.time });
          }
        }
      } catch (error) {
        console.error('Failed to load initial audit time', error);
      }
    };
    fetchAuditTime();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({
      updateTime: value,
    });
    setSelectedTime(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/audit/time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          time: formData.updateTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule');
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          updateTime: '',
        });
        setSelectedTime('');
      }, 2000);
    } catch (error) {
      console.error('Error scheduling audit:', error);
      alert('Failed to schedule night audit. Is the backend running?');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the scheduled night audit?')) return;
    
    try {
      const response = await fetch('http://localhost:8000/audit/time', {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      
      alert('Night audit schedule removed');
      setSelectedTime('');
      setFormData({ updateTime: '' });
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete schedule.');
    }
  };

  const buttonText = submitted ? '✓ Night Schedule Updated!' : 'Schedule Night Update';
  const buttonClass = submitted
    ? 'bg-green-500 text-white shadow-lg'
    : 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md hover:shadow-lg';

  return (
    <Card className="p-8 bg-card shadow-lg border border-border">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Night Update Management</h2>
        <p className="text-muted-foreground">Schedule when night pricing updates should be applied</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Time Picker */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-8 border border-primary/20">
          <label htmlFor="nightTime" className="block text-sm font-semibold text-foreground mb-4">
            🌙 Time to Update Night Pricing
          </label>
          <input
            suppressHydrationWarning
            type="time"
            id="nightTime"
            value={formData.updateTime}
            onChange={handleInputChange}
            required
            className="w-full px-6 py-4 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground text-lg"
          />
          {selectedTime && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Selected Time:</span> {selectedTime}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Night pricing will be applied at this time daily
                </p>
              </div>
              <Button 
                type="button" 
                variant="destructive" 
                size="sm"
                onClick={handleDelete}
                className="shadow-sm hover:shadow"
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-6">
            <div className="text-lg font-semibold text-secondary mb-2">⏰ Current Setting</div>
            <p className="text-sm text-muted-foreground">
              Update night rates to apply special pricing for late-night bookings and overnight stays
            </p>
          </div>
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
            <div className="text-lg font-semibold text-accent mb-2">📅 Automatic Schedule</div>
            <p className="text-sm text-muted-foreground">
              Once set, this update will run automatically every night at the specified time
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            suppressHydrationWarning
            type="submit"
            className={`w-full py-4 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-lg ${buttonClass}`}
          >
            {buttonText}
          </Button>
        </div>
      </form>

      {/* Status Indicator */}
      <div className="mt-8 p-6 bg-card border border-border rounded-lg">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🛏️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Night Pricing Active</h3>
            <p className="text-sm text-muted-foreground">
              Your night pricing system is ready. Set the time above to activate automated night rate adjustments across all room categories.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
