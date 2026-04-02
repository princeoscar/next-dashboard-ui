"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function useListData<T>(endpoint: string) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<T[]>([]);
  const [count, setCount] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // This calls your API (e.g., /api/teachers or /api/students)
        const res = await fetch(`/api/${endpoint}?${searchParams.toString()}`);
        const result = await res.json();
        
        setData(result.data || []);
        setCount(result.count || 0);
        setRole(result.role || "student");
      } catch (err) {
        console.error(`Error fetching ${endpoint}:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams, endpoint]);

  return { data, count, role, loading, searchParams };
}