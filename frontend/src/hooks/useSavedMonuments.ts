import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'heritageguard_saved_monuments';
const CUSTOM_EVENT_NAME = 'heritageguard_saved_monuments_changed';

// Read saved monument site_ids from localStorage
export function getSavedMonumentIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      // Filter valid non-empty string IDs
      return Array.from(new Set(parsed.filter((id) => typeof id === 'string' && id.trim().length > 0)));
    }
  } catch (err) {
    console.error('Failed to parse saved monuments from localStorage:', err);
  }
  return [];
}

// Write saved monument site_ids to localStorage & notify listeners
export function setSavedMonumentIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  const uniqueIds = Array.from(new Set(ids.filter((id) => typeof id === 'string' && id.trim().length > 0)));
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(uniqueIds));
    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_NAME, { detail: uniqueIds }));
  } catch (err) {
    console.error('Failed to write saved monuments to localStorage:', err);
  }
}

// React Hook to subscribe to and mutate saved monument site_ids
export function useSavedMonuments() {
  const [savedIds, setSavedIds] = useState<string[]>(getSavedMonumentIds);

  const refresh = useCallback(() => {
    setSavedIds(getSavedMonumentIds());
  }, []);

  useEffect(() => {
    refresh();

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      if (Array.isArray(customEvent.detail)) {
        setSavedIds(customEvent.detail);
      } else {
        refresh();
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        refresh();
      }
    };

    window.addEventListener(CUSTOM_EVENT_NAME, handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener(CUSTOM_EVENT_NAME, handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [refresh]);

  const isSaved = useCallback(
    (siteId: string): boolean => {
      if (!siteId) return false;
      return savedIds.includes(siteId.toUpperCase()) || savedIds.includes(siteId);
    },
    [savedIds]
  );

  const toggleSave = useCallback(
    (siteId: string) => {
      if (!siteId) return;
      const cleanId = siteId.toUpperCase();
      const current = getSavedMonumentIds();
      let updated: string[];
      if (current.includes(cleanId) || current.includes(siteId)) {
        updated = current.filter((id) => id !== cleanId && id !== siteId);
      } else {
        updated = [...current, cleanId];
      }
      setSavedMonumentIds(updated);
      setSavedIds(updated);
    },
    []
  );

  return {
    savedIds,
    isSaved,
    toggleSave,
    savedCount: savedIds.length
  };
}
