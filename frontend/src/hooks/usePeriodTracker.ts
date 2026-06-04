'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Period {
  _id: string;
  startDate: string;
  endDate: string;
  flow: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  notes?: string;
}

export interface Prediction {
  nextPeriod: string;
  ovulationDate: string;
  fertileWindow: {
    start: string;
    end: string;
  };
  daysUntilNextPeriod: number;
}

export function usePeriodTracker() {
  const { token } = useAuth();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/periods`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPeriods(response.data.periods);
      setPrediction(response.data.prediction);
      setError(null);
    } catch (error: any) {
      console.error('Failed to fetch periods:', error);
      setError(error.response?.data?.message || 'Failed to fetch periods');
    } finally {
      setLoading(false);
    }
  };

  const addPeriod = async (periodData: Omit<Period, '_id'>) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await axios.post(`${API_URL}/periods`, periodData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchPeriods();
      toast.success('Period logged successfully! 🎉');
      return { success: true, period: response.data.period, prediction: response.data.prediction };
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to log period');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const updatePeriod = async (id: string, periodData: Partial<Period>) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await axios.put(`${API_URL}/periods/${id}`, periodData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchPeriods();
      toast.success('Period updated successfully!');
      return { success: true, period: response.data.period, prediction: response.data.prediction };
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update period');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const deletePeriod = async (id: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      await axios.delete(`${API_URL}/periods/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchPeriods();
      toast.success('Period deleted successfully');
      return { success: true };
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete period');
      return { success: false, error: error.response?.data?.message };
    }
  };

  useEffect(() => {
    if (token) {
      fetchPeriods();
    }
  }, [token]);

  return {
    periods,
    prediction,
    loading,
    error,
    addPeriod,
    updatePeriod,
    deletePeriod,
    fetchPeriods
  };
}