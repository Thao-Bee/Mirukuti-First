import React, { createContext, useContext, useState, useEffect } from 'react';

interface YearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  years: string[];
  isLoading: boolean;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export function YearProvider({ children }: { children: React.ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<string>('2024-2025');
  const [years, setYears] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/years')
      .then(res => res.json())
      .then(data => {
        const yearList = data.map((y: any) => y.year);
        setYears(yearList);
        const current = data.find((y: any) => y.is_current === 1);
        if (current) {
          setSelectedYear(current.year);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch years', err);
        setIsLoading(false);
      });
  }, []);

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear, years, isLoading }}>
      {children}
    </YearContext.Provider>
  );
}

export function useYear() {
  const context = useContext(YearContext);
  if (context === undefined) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
}
