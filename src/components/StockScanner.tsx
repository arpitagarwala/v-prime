'use client';
import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import styles from './StockScanner.module.css';

export default function StockScanner() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetcher = async (url: string) => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];
    const res = await fetch(url);
    const data = await res.json();
    return data.success ? data.data : [];
  };

  const { data: results, isLoading } = useSWR(
    debouncedQuery.length >= 2 ? `/api/market/symbol-search?q=${encodeURIComponent(debouncedQuery)}` : null,
    fetcher
  );

  const handleSelect = (symbol: string) => {
    setIsFocused(false);
    setQuery('');
    setDebouncedQuery('');
    router.push(`/terminal/${symbol}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results && results.length > 0) {
      handleSelect(results[0].symbol);
    }
  };

  return (
    <div className={styles.scannerWrapper} ref={wrapperRef}>
      <div className={styles.searchBar}>
        <Search size={14} color="var(--text-muted)" className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search 50,000+ equities or indices..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          className={styles.searchInput}
        />
        {isLoading && query.length >= 2 && (
          <Loader2 size={14} color="var(--accent)" className={styles.spinIcon} />
        )}
      </div>

      {isFocused && (debouncedQuery.length >= 2) && (
        <div className={styles.dropdown}>
          {isLoading && !results ? (
             <div className={styles.emptyState}>Scanning Markets...</div>
          ) : results && results.length > 0 ? (
            <div className={styles.resultsList}>
              {results.map((item: any) => (
                <div 
                  key={item.symbol} 
                  className={styles.resultItem}
                  onClick={() => handleSelect(item.symbol)}
                >
                  <div className={styles.resultDetails}>
                    <span className={styles.resultSymbol}>{item.symbol}</span>
                    <span className={styles.resultName}>{item.name}</span>
                  </div>
                  <div className={styles.resultMeta}>
                    <span className={styles.resultExchange}>{item.exchange}</span>
                    <ArrowRight size={12} color="var(--text-muted)" className={styles.actionIcon} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>No matching assets found.</div>
          )}
        </div>
      )}
    </div>
  );
}
