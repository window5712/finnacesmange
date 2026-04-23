"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/types/finance';

// Initialize Supabase client (reuse environment variables)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function CompanyWallet() {
  const [wallet, setWallet] = useState<{ wallet_balance: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWallet() {
      const { data, error } = await supabase.from('company_wallet').select('*').single();
      if (error) {
        console.error('Failed to fetch company wallet:', error);
        setLoading(false);
        return;
      }
      setWallet(data as any);
      setLoading(false);
    }
    fetchWallet();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Company Wallet</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Company Wallet Balance</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold text-emerald-600">
        {wallet ? formatCurrency(wallet.wallet_balance) : '—'}
      </CardContent>
    </Card>
  );
}
