'use client';

import { useState, useEffect, useCallback } from 'react';

export interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  description: string;
  is_enabled: boolean;
  icon: string;
  category: string;
}

export function useFeatureFlags() {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatures = useCallback(async () => {
    try {
      const res = await fetch('/api/features');
      if (res.ok) {
        const data = await res.json();
        setFeatures(data);
      }
    } catch (err) {
      console.error('Failed to fetch feature flags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const isEnabled = useCallback(
    (key: string): boolean => {
      const flag = features.find((f) => f.key === key);
      return flag ? flag.is_enabled : false;
    },
    [features]
  );

  const toggle = useCallback(
    async (key: string, enabled: boolean) => {
      try {
        const res = await fetch(`/api/features/${key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ is_enabled: enabled }),
        });
        if (res.ok) {
          setFeatures((prev) =>
            prev.map((f) => (f.key === key ? { ...f, is_enabled: enabled } : f))
          );
        }
        return res.ok;
      } catch {
        return false;
      }
    },
    []
  );

  return { features, loading, isEnabled, toggle, refetch: fetchFeatures };
}
