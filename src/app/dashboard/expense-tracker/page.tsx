'use client';
import { AddTransactionForm } from '@/components/dashboard/expense-tracker/AddTransactionForm';
import { ExpenseSummary } from '@/components/dashboard/expense-tracker/ExpenseSummary';
import { TransactionList } from '@/components/dashboard/expense-tracker/TransactionList';
import { generateExpenseReportPDF } from '@/lib/pdf-generator';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';


export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: Date;
  description: string;
  currency: 'INR' | 'USD' | 'EUR';
};

// Mock data, in a real app this would come from Firestore
const initialTransactions: Transaction[] = [];


export default function ExpenseTrackerPage() {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const { user } = useAuth();
    const { t } = useTranslation();

    const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
        // In a real app, you would save this to Firestore
        console.log("Adding transaction (to be saved in Firestore):", transaction);
        const newTransaction: Transaction = {
            id: new Date().toISOString(), // Use a better ID in production
            ...transaction
        };
        setTransactions(prev => [newTransaction, ...prev]);
    }

    const handleDeleteTransaction = (id: string) => {
        // In a real app, you would delete this from Firestore
        console.log("Deleting transaction (to be deleted from Firestore):", id);
        setTransactions(prev => prev.filter(t => t.id !== id));
    }
    
    const handleExport = () => {
        if (user) {
            generateExpenseReportPDF(transactions, user.displayName || 'Farmer');
        }
    }

  return (
    <main>
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold">{t('expenseTrackerPage.title')}</h1>
            <p className="text-muted-foreground">
            {t('expenseTrackerPage.description')}
            </p>
        </div>
        <Button onClick={handleExport} disabled={transactions.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            {t('expenseTrackerPage.exportPdf')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
            <TransactionList transactions={transactions} onDeleteTransaction={handleDeleteTransaction} />
        </div>
        <div className="lg:col-span-1 space-y-6 sticky top-20">
            <ExpenseSummary transactions={transactions} />
            <AddTransactionForm onSubmit={handleAddTransaction} />
        </div>
      </div>
    </main>
  );
}
