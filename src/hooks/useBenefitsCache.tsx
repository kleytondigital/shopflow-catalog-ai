
import { useState, useCallback, useRef } from 'react';
import { SystemBenefit } from '@/hooks/useSystemBenefits';
import { PlanBenefit } from '@/hooks/usePlanBenefits';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface BenefitsCache {
  systemBenefits: CacheEntry<SystemBenefit[]> | null;
  planBenefits: Record<string, CacheEntry<PlanBenefit[]>>;
  benefitValidation: Record<string, CacheEntry<boolean>>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const VALIDATION_CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

export const useBenefitsCache = () => {
  const cacheRef = useRef<BenefitsCache>({
    systemBenefits: null,
    planBenefits: {},
    benefitValidation: {}
  });

  const isExpired = useCallback((entry: CacheEntry<any>) => {
    return Date.now() > entry.expiresAt;
  }, []);

  const setSystemBenefits = useCallback((benefits: SystemBenefit[]) => {
    const now = Date.now();
    cacheRef.current.systemBenefits = {
      data: benefits,
      timestamp: now,
      expiresAt: now + CACHE_DURATION
    };
    console.log('💾 Cached system benefits:', benefits.length);
  }, []);

  const getSystemBenefits = useCallback((): SystemBenefit[] | null => {
    const cached = cacheRef.current.systemBenefits;
    if (!cached || isExpired(cached)) {
      console.log('💾 System benefits cache miss or expired');
      return null;
    }
    console.log('💾 System benefits cache hit');
    return cached.data;
  }, [isExpired]);

  const setPlanBenefits = useCallback((planId: string, benefits: PlanBenefit[]) => {
    const now = Date.now();
    cacheRef.current.planBenefits[planId] = {
      data: benefits,
      timestamp: now,
      expiresAt: now + CACHE_DURATION
    };
    console.log(`💾 Cached plan benefits for ${planId}:`, benefits.length);
  }, []);

  const getPlanBenefits = useCallback((planId: string): PlanBenefit[] | null => {
    const cached = cacheRef.current.planBenefits[planId];
    if (!cached || isExpired(cached)) {
      console.log(`💾 Plan benefits cache miss or expired for ${planId}`);
      return null;
    }
    console.log(`💾 Plan benefits cache hit for ${planId}`);
    return cached.data;
  }, [isExpired]);

  const setBenefitValidation = useCallback((key: string, isValid: boolean) => {
    const now = Date.now();
    cacheRef.current.benefitValidation[key] = {
      data: isValid,
      timestamp: now,
      expiresAt: now + VALIDATION_CACHE_DURATION
    };
  }, []);

  const getBenefitValidation = useCallback((key: string): boolean | null => {
    const cached = cacheRef.current.benefitValidation[key];
    if (!cached || isExpired(cached)) {
      return null;
    }
    return cached.data;
  }, [isExpired]);

  const invalidateAll = useCallback(() => {
    console.log('💾 Invalidating all benefits cache');
    cacheRef.current = {
      systemBenefits: null,
      planBenefits: {},
      benefitValidation: {}
    };
  }, []);

  const invalidatePlan = useCallback((planId: string) => {
    console.log(`💾 Invalidating cache for plan ${planId}`);
    delete cacheRef.current.planBenefits[planId];
  }, []);

  const getCacheStats = useCallback(() => {
    const now = Date.now();
    return {
      systemBenefits: {
        cached: !!cacheRef.current.systemBenefits,
        expired: cacheRef.current.systemBenefits ? isExpired(cacheRef.current.systemBenefits) : true,
        age: cacheRef.current.systemBenefits ? now - cacheRef.current.systemBenefits.timestamp : 0
      },
      planBenefits: Object.keys(cacheRef.current.planBenefits).length,
      validationCache: Object.keys(cacheRef.current.benefitValidation).length
    };
  }, [isExpired]);

  return {
    setSystemBenefits,
    getSystemBenefits,
    setPlanBenefits,
    getPlanBenefits,
    setBenefitValidation,
    getBenefitValidation,
    invalidateAll,
    invalidatePlan,
    getCacheStats
  };
};
