
'use client';

import { AddTransactionForm } from '@/components/dashboard/expense-tracker/AddTransactionForm';
import { ExpenseSummary } from '@/components/dashboard/expense-tracker/ExpenseSummary';
import { TransactionList } from '@/components/dashboard/expense-tracker/TransactionList';
import { generateExpenseReportPDF } from '@/lib/pdf-generator';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export type Transaction = {
  id: string;
  itemId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: Date;
  description: string;
  currency: 'INR' | 'USD' | 'EUR';
};

export type TrackedItem = {
    id: string;
    name: string;
}

const ITEMS_STORAGE_KEY_PREFIX = 'agriVision-items';
const TRANSACTIONS_STORAGE_KEY_PREFIX = 'agriVision-transactions';


export default function ExpenseTrackerPage() {
    const itemType = 'crop'; // This page is for crops
    const ITEMS_STORAGE_KEY = `${ITEMS_STORAGE_KEY_PREFIX}-${itemType}`;
    const TRANSACTIONS_STORAGE_KEY = `${TRANSACTIONS_STORAGE_KEY_PREFIX}-${itemType}`;

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [items, setItems] = useState<TrackedItem[]>([]);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const { user } = useAuth();
    const { t } = useTranslation();
    const { toast } = useToast();

    // Load data from localStorage on mount
    useEffect(() => {
        const storedItems = localStorage.getItem(ITEMS_STORAGE_KEY);
        if (storedItems) {
            const loadedItems: TrackedItem[] = JSON.parse(storedItems);
            setItems(loadedItems);
            if(loadedItems.length > 0 && !activeItemId) {
                setActiveItemId(loadedItems[0].id);
            }
        }

        const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
        if(storedTransactions) {
            setTransactions(JSON.parse(storedTransactions).map((t: Transaction) => ({...t, date: new Date(t.date)})));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeItemId]);

    const saveItems = (newItems: TrackedItem[]) => {
        setItems(newItems);
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(newItems));
    }

    const saveTransactions = (newTransactions: Transaction[]) => {
        setTransactions(newTransactions);
        localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(newTransactions));
    }

    const handleAddItem = () => {
        if(!newItemName.trim()){
            toast({ variant: 'destructive', title: 'Crop name cannot be empty.'});
            return;
        }
        const newItem: TrackedItem = { id: Date.now().toString(), name: newItemName.trim() };
        const updatedItems = [...items, newItem];
        saveItems(updatedItems);
        setActiveItemId(newItem.id);
        setNewItemName('');
        toast({ title: `Crop tracker "${newItem.name}" created.` });
    }

    const handleDeleteItem = (itemIdToDelete: string) => {
        const itemToDelete = items.find(c => c.id === itemIdToDelete);
        if (!itemToDelete) return;

        // Filter out the item and its transactions
        const updatedItems = items.filter(c => c.id !== itemIdToDelete);
        const updatedTransactions = transactions.filter(t => t.itemId !== itemIdToDelete);

        saveItems(updatedItems);
        saveTransactions(updatedTransactions);

        // If the deleted item was the active one, switch to another or to null
        if (activeItemId === itemIdToDelete) {
            setActiveItemId(updatedItems.length > 0 ? updatedItems[0].id : null);
        }

        toast({ title: `Crop tracker "${itemToDelete.name}" deleted.`});
    }

    const handleAddTransaction = (transaction: Omit<Transaction, 'id' | 'itemId'>) => {
        if (!activeItemId) {
            toast({ variant: 'destructive', title: 'Please select a crop first.' });
            return;
        }
        const newTransaction: Transaction = {
            id: new Date().toISOString(),
            itemId: activeItemId,
            ...transaction
        };
        saveTransactions([newTransaction, ...transactions]);
    }

    const handleDeleteTransaction = (id: string) => {
        saveTransactions(transactions.filter(t => t.id !== id));
    }
    
    const handleExport = () => {
        if (user && activeItem) {
            generateExpenseReportPDF(filteredTransactions, `${user.displayName} - ${activeItem.name}`);
        }
    }

    const activeItem = useMemo(() => items.find(c => c.id === activeItemId), [items, activeItemId]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => t.itemId === activeItemId);
    }, [transactions, activeItemId]);

  return (
    <main>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold">{t('expenseTrackerPage.title')} for Crops</h1>
            <p className="text-muted-foreground">
            {t('expenseTrackerPage.description')}
            </p>
        </div>
        <div className="flex items-center gap-4">
             {items.length > 0 && (
                <Select onValueChange={setActiveItemId} value={activeItemId || ''}>
                    <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Select a crop tracker" />
                    </SelectTrigger>
                    <SelectContent>
                        {items.map(item => (
                            <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             )}
            <Button onClick={handleExport} disabled={filteredTransactions.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                {t('expenseTrackerPage.exportPdf')}
            </Button>
        </div>
      </div>

       {items.length === 0 ? (
         <Card className="max-w-xl mx-auto my-16 text-center p-8">
            <CardHeader>
                <CardTitle>Create Your First Crop Tracker</CardTitle>
                <CardDescription>To start tracking expenses, you need to add a crop first. For example, "Wheat Field 1" or "Summer Vegetables".</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center gap-2 max-w-sm mx-auto">
                    <Input 
                        placeholder="e.g., Wheat - Field A"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                    />
                    <Button onClick={handleAddItem} size="icon">
                        <PlusCircle />
                    </Button>
                </div>
            </CardContent>
         </Card>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <TransactionList 
                        transactions={filteredTransactions} 
                        onDeleteTransaction={handleDeleteTransaction} 
                        itemName={activeItem?.name || ''}
                    />
                </div>
                <div className="lg:col-span-1 space-y-6 sticky top-20">
                    <AddTransactionForm onSubmit={handleAddTransaction} disabled={!activeItemId} />
                    <ExpenseSummary transactions={filteredTransactions} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Crop Trackers</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-2">
                                <Input 
                                    placeholder="Add new crop tracker..."
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                />
                                <Button onClick={handleAddItem} size="icon">
                                    <PlusCircle />
                                </Button>
                            </div>
                             <div className="mt-4 space-y-2">
                                {items.map(item => (
                                    <div key={item.id} className="text-sm p-2 rounded-md bg-secondary flex justify-between items-center">
                                        <span>{item.name}</span>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the crop tracker for "{item.name}" and all its associated income and expense records. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )}
    </main>
  );
}
