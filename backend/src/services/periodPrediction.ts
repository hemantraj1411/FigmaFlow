import { IPeriod } from '../models/Period.js';

export const predictNextPeriod = (periods: IPeriod[], cycleLength: number) => {
  if (!periods || periods.length === 0) {
    return null;
  }
  
  const lastPeriod = periods[0];
  const lastStartDate = new Date(lastPeriod.startDate);
  const nextPeriodDate = new Date(lastStartDate);
  nextPeriodDate.setDate(lastStartDate.getDate() + cycleLength);
  
  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(nextPeriodDate.getDate() - 14);
  
  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(ovulationDate.getDate() - 5);
  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(ovulationDate.getDate() + 1);
  
  return {
    nextPeriod: nextPeriodDate,
    ovulationDate,
    fertileWindow: { start: fertileStart, end: fertileEnd },
    daysUntilNextPeriod: Math.ceil((nextPeriodDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
  };
};