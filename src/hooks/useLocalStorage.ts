/**
 * LocalStorage Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { storageService, STORAGE_SIZE_THRESHOLD } from '@/services';

export interface UseLocalStorageOptions {
  skipLocalStorage?: boolean;
  onQuotaExceeded?: (message: string) => void;
  onLargeDataset?: (message: string) => void;
}

export interface SetValueError {
  type: 'quota_exceeded' | 'size_threshold_exceeded' | 'unknown';
  message: string;
  dataSize?: number;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions
) {
  const skipLocalStorageRef = useRef(options?.skipLocalStorage ?? false);
  const [lastError, setLastError] = useState<SetValueError | null>(null);

  // 初始化状态
  const [storedValue, setStoredValue] = useState<T>(() => {
    // 如果 skipLocalStorage 为 true，直接使用 initialValue
    if (skipLocalStorageRef.current) {
      return initialValue;
    }

    try {
      const item = storageService.get<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // 更新 skipLocalStorage 选项
  useEffect(() => {
    skipLocalStorageRef.current = options?.skipLocalStorage ?? false;
  }, [options?.skipLocalStorage]);

  // 更新值
  const setValue = useCallback(
    async (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // 清除之前的错误
        setLastError(null);

        // 如果 skipLocalStorage 为 true，只更新内存状态
        if (skipLocalStorageRef.current) {
          setStoredValue(valueToStore);
          
          // 但仍然尝试保存到 localStorage（用于备份），失败就忽略
          try {
            const result = await storageService.set(key, valueToStore);
            if (result === true) {
              console.log(`✅ ${key}: 数据已保存到 localStorage`);
            } else {
              console.warn(`⚠️ ${key}: 无法保存到 localStorage（空间不足）`);
            }
          } catch (e) {
            // 忽略错误，数据已经在内存中
          }
          
          return;
        }

        // 估算数据大小
        const dataSize = storageService.estimateDataSize(valueToStore);

        // 检查数据大小是否超过阈值
        if (dataSize > STORAGE_SIZE_THRESHOLD) {
          const message = '数据量较大，已保存到云端存储';
          console.warn(`${key}: ${message} (${(dataSize / 1024 / 1024).toFixed(2)}MB)`);
          
          setLastError({
            type: 'size_threshold_exceeded',
            message,
            dataSize
          });

          // 调用回调通知调用者
          if (options?.onLargeDataset) {
            options.onLargeDataset(message);
          }

          // 自动切换到 skipLocalStorage 模式
          skipLocalStorageRef.current = true;
          setStoredValue(valueToStore);
          
          // 尝试保存到 localStorage（用于备份），失败就忽略
          try {
            const result = await storageService.set(key, valueToStore);
            if (result === true) {
              console.log(`✅ ${key}: 大数据已保存到 localStorage 用于备份`);
            } else {
              console.warn(`⚠️ ${key}: 无法保存到 localStorage（空间不足），仅保存到云端`);
            }
          } catch (e) {
            console.warn(`⚠️ ${key}: 无法保存到 localStorage，仅保存到云端`);
          }
          
          return;
        }

        // 尝试保存到 localStorage
        const result = await storageService.set(key, valueToStore);

        // 处理保存结果
        if (result === true) {
          // 保存成功
          setStoredValue(valueToStore);
        } else if (typeof result === 'object' && result.success === false) {
          // 保存失败，处理不同的错误原因
          let errorMessage = '存储空间不足，已自动切换到云端存储';
          let errorType: SetValueError['type'] = 'quota_exceeded';

          if (result.reason === 'size_threshold_exceeded') {
            errorMessage = '数据量较大，已保存到云端存储';
            errorType = 'size_threshold_exceeded';
          } else if (result.reason === 'quota_exceeded' || result.reason === 'quota_exceeded_error') {
            errorMessage = '存储空间不足，已自动切换到云端存储';
            errorType = 'quota_exceeded';
          }

          console.warn(`${key}: ${errorMessage}`, result);

          setLastError({
            type: errorType,
            message: errorMessage,
            dataSize: result.dataSize
          });

          // 调用相应的回调
          if (errorType === 'quota_exceeded' && options?.onQuotaExceeded) {
            options.onQuotaExceeded(errorMessage);
          } else if (errorType === 'size_threshold_exceeded' && options?.onLargeDataset) {
            options.onLargeDataset(errorMessage);
          }

          // 自动切换到 skipLocalStorage 模式
          skipLocalStorageRef.current = true;
          setStoredValue(valueToStore);
        } else {
          // 其他错误情况
          console.error(`Error saving ${key} to localStorage:`, result);
          setStoredValue(valueToStore);
        }
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
        
        setLastError({
          type: 'unknown',
          message: '保存数据时发生错误'
        });
      }
    },
    [key, options, storedValue]
  );

  // 删除值
  const removeValue = useCallback(() => {
    try {
      if (!skipLocalStorageRef.current) {
        storageService.remove(key);
      }
      setStoredValue(initialValue);
      setLastError(null);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }, [key, initialValue]);

  // 监听其他标签页的变化和登录成功事件
  useEffect(() => {
    // 如果 skipLocalStorage 为 true，不监听 storage 事件
    if (skipLocalStorageRef.current) {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage event for ${key}:`, error);
        }
      }
    };

    // 监听登录成功事件，重新从 localStorage 加载数据
    const handleLoginSuccess = () => {
      try {
        const item = storageService.get<T>(key);
        if (item !== null) {
          setStoredValue(item);
          console.log(`✅ ${key} 数据已从云端恢复`);
        }
      } catch (error) {
        console.error(`Error reloading ${key} after login:`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('loginSuccess', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, [key]);

  return [storedValue, setValue, removeValue, lastError] as const;
}
