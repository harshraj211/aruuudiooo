
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import type { Transaction } from './AddTransactionForm';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

type ExpenseSummaryProps = {
  transactions: Transaction[];
};

const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
};

export function ExpenseSummary({ transactions }: ExpenseSummaryProps) {
  const { t } = useTranslation();
  const summary = useMemo(() => {
    // Note: This is a simplified summary. In a real app, you'd want to handle currency conversions
    // or group by currency. For this prototype, we'll assume all transactions are in INR for the summary.
    const currentMonthTransactions = transactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth());

    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === 'income' && t.currency === 'INR')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = currentMonthTransactions
      .filter((t) => t.type === 'expense' && t.currency === 'INR')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const profitLoss = totalIncome - totalExpense;

    return { totalIncome, totalExpense, profitLoss };
  }, [transactions]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('expenseTrackerPage.summary.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div className='flex items-center gap-3'>
                <div className='p-2 rounded-full bg-green-100 dark:bg-green-900/50'>
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">{t('expenseTrackerPage.summary.totalIncome')}</div>
                    <div className="text-2xl font-bold">₹{summary.totalIncome.toLocaleString()}</div>
                </div>
            </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div className='flex items-center gap-3'>
                <div className='p-2 rounded-full bg-red-100 dark:bg-red-900/50'>
                    <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">{t('expenseTrackerPage.summary.totalExpense')}</div>
                    <div className="text-2xl font-bold">₹{summary.totalExpense.toLocaleString()}</div>
                </div>
            </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
             <div className='flex items-center gap-3'>
                <div className='p-2 rounded-full bg-blue-100 dark:bg-blue-900/50'>
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">{t('expenseTrackerPage.summary.profitLoss')}</div>
                    <div className={cn("text-2xl font-bold", summary.profitLoss >= 0 ? 'text-green-600' : 'text-red-600')}>
                        {summary.profitLoss < 0 ? '-' : ''}₹{Math.abs(summary.profitLoss).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
