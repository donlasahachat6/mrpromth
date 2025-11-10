'use client';

import { Sparkles } from 'lucide-react';
import { useModelCount } from '@/hooks/use-model-count';

export function ModelCountBadge() {
  const { count, loading } = useModelCount();

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
      <Sparkles className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium text-primary">
        {loading ? 'Loading...' : `Powered by ${count} AI Models`}
      </span>
    </div>
  );
}
