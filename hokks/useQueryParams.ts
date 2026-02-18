"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useMemo } from "react";

type QueryValue = string | number | boolean | null | undefined;
type QueryObject = Record<string, QueryValue>;

function useQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  const get = (key: string, defaultValue: string = "") => query.get(key) || defaultValue;

  const compare = (key: string, expected: string): boolean => get(key) === expected;

  const update = (updates: QueryObject, keysToRemove: string[] = []) => {
    const params = new URLSearchParams(query.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    if (keysToRemove.length > 0) {
      keysToRemove.forEach((key) => params.delete(key));
    }

    router.replace(`?${params.toString()}`);
  };

  const remove = (keys: string[]) => {
    const params = new URLSearchParams(query.toString());

    keys.forEach((key) => params.delete(key));
    router.replace(`?${params.toString()}`);
  };

  const reset = (newObj?: QueryObject) => {
    if (newObj) {
      const params = new URLSearchParams();
      Object.entries(newObj).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.replace(`?${params.toString()}`);
    } else {
      router.replace("?");
    }
  };

  return {
    query,
    get,
    compare,
    update,
    remove,
    reset,
  };
}

export default useQueryParams;
