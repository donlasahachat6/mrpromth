'use client';

import { useEffect, useState } from 'react';

export function useModelCount() {
  const [count, setCount] = useState<number>(39); // Default fallback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModelCount() {
      try {
        const response = await fetch('/api/ai/models');
        if (!response.ok) {
          throw new Error('Failed to fetch model count');
        }
        const data = await response.json();
        setCount(data.count || 39);
      } catch (err) {
        console.error('Error fetching model count:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchModelCount();
  }, []);

  return { count, loading, error };
}
