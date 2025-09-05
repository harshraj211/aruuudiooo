
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from './AddTransactionForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useTranslation } from '@/hooks/useTranslation';


type TransactionListProps = {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  itemName: string;
};

const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
};

export function TransactionList({ transactions, onDeleteTransaction, itemName }: TransactionListProps) {
  const { t } = useTranslation();
  return (
    <Card className='h-[calc(100vh-12rem)]'>
      <CardHeader>
        <CardTitle>{t('expenseTrackerPage.transactionList.title')} for {itemName}</CardTitle>
        <CardDescription>
          {t('expenseTrackerPage.transactionList.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-18rem)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('expenseTrackerPage.transactionList.type')}</TableHead>
              <TableHead>{t('expenseTrackerPage.transactionList.description')}</TableHead>
              <TableHead>{t('expenseTrackerPage.transactionList.date')}</TableHead>
              <TableHead className="text-right">{t('expenseTrackerPage.transactionList.amount')}</TableHead>
              <TableHead className="w-[50px]"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        {t('expenseTrackerPage.transactionList.noTransactions')}
                    </TableCell>
                </TableRow>
            )}
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Badge
                    variant={transaction.type === 'income' ? 'default' : 'destructive'}
                    className={cn(
                        'capitalize',
                        transaction.type === 'income' ? 'bg-green-600/80' : 'bg-red-600/80'
                    )}
                  >
                    {t(`expenseTrackerPage.transactionList.${transaction.type}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                    <p className='font-medium'>{transaction.category}</p>
                    <p className='text-xs text-muted-foreground'>{transaction.description}</p>
                </TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right font-medium">
                    {currencySymbols[transaction.currency] || ''}{transaction.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('expenseTrackerPage.transactionList.deleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('expenseTrackerPage.transactionList.deleteDescription')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('expenseTrackerPage.transactionList.deleteCancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteTransaction(transaction.id)}>{t('expenseTrackerPage.transactionList.deleteConfirm')}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
