import { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Auto-saves calculator fields to a matching Deal by address.
 * Returns { matchedDeal, saveStatus }
 */
export function useCalculatorAutoSave(address, data) {
  const [matchedDeal, setMatchedDeal] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'saving' | null
  const debounceRef = useRef(null);
  const lastSavedRef = useRef(null);

  // Find matching deal when address changes
  useEffect(() => {
    if (!address || address.trim().length < 5) {
      setMatchedDeal(null);
      return;
    }
    const query = address.trim().toLowerCase();
    base44.entities.Deal.list().then(deals => {
      const match = deals.find(d =>
        d.property_address && d.property_address.toLowerCase().includes(query.split(',')[0].trim())
      );
      setMatchedDeal(match || null);
    });
  }, [address]);

  // Auto-save when data changes and we have a matched deal
  const save = useCallback((deal, payload) => {
    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedRef.current) return;
    setSaveStatus('saving');
    base44.entities.Deal.update(deal.id, payload).then(() => {
      lastSavedRef.current = serialized;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    });
  }, []);

  useEffect(() => {
    if (!matchedDeal) return;
    // Filter out empty/zero values to avoid overwriting real deal data with blanks
    const payload = {};
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '' && v !== 0) {
        payload[k] = v;
      }
    });
    if (Object.keys(payload).length === 0) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(matchedDeal, payload), 800);
    return () => clearTimeout(debounceRef.current);
  }, [data, matchedDeal, save]);

  return { matchedDeal, saveStatus };
}