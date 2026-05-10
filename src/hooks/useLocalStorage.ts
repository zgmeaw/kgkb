/**
 * LocalStorage Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { storageService } from '@/services';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 初始化状态
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storageService.get<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // 更新值
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((currentValue) => {
          const valueToStore = value instanceof Function ? value(currentValue) : value;
          storageService.set(key, valueToStore);
          return valueToStore;
        });
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    },
    [key]
  );

  // 删除值
  const removeValue = useCallback(() => {
    try {
      storageService.remove(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }, [key, initialValue]);

  // 监听其他标签页的变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage event for ${key}:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue] as const;
}
