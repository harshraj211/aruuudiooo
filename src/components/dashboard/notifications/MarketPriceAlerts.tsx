'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Bell, PlusCircle, ArrowDown, ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

const PRICE_ALERTS_KEY = 'agriVision-priceAlerts';

export type PriceAlert = {
  id: string;
  crop: string;
  threshold: number;
  condition: 'above' | 'below';
};

export function MarketPriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [newCrop, setNewCrop] = useState('');
  const [newThreshold, setNewThreshold] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const storedAlerts = localStorage.getItem(PRICE_ALERTS_KEY);
    if (storedAlerts) {
      setAlerts(JSON.parse(storedAlerts));
    }
  }, []);

  const saveAlerts = (newAlerts: PriceAlert[]) => {
    setAlerts(newAlerts);
    localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(newAlerts));
  }

  const handleAddAlert = (condition: 'above' | 'below') => {
    if (!newCrop || !newThreshold) {
      toast({
        variant: 'destructive',
        title: t('notificationsPage.priceAlerts.addErrorTitle'),
        description: t('notificationsPage.priceAlerts.addErrorDescription'),
      });
      return;
    }
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      crop: newCrop,
      threshold: parseFloat(newThreshold),
      condition,
    };
    saveAlerts([...alerts, newAlert]);
    setNewCrop('');
    setNewThreshold('');
    toast({
      title: t('notificationsPage.priceAlerts.alertSet'),
      description: `${t('notificationsPage.priceAlerts.notifyWhen')} ${newAlert.crop} ${newAlert.condition === 'above' ? t('notificationsPage.priceAlerts.goesAbove') : t('notificationsPage.priceAlerts.goesBelow')} ₹${newAlert.threshold}.`,
    });
  };

  const handleRemoveAlert = (id: string) => {
    const newAlerts = alerts.filter(alert => alert.id !== id);
    saveAlerts(newAlerts);
     toast({
      title: t('notificationsPage.priceAlerts.alertRemoved'),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notificationsPage.priceAlerts.title')}</CardTitle>
        <CardDescription>{t('notificationsPage.priceAlerts.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-6 p-4 border rounded-lg">
          <div className='flex-1 space-y-2'>
            <Label className="text-sm font-medium">{t('notificationsPage.priceAlerts.newAlert')}</Label>
            <div className="flex gap-2">
                <Input
                placeholder={t('notificationsPage.priceAlerts.cropName')}
                value={newCrop}
                onChange={(e) => setNewCrop(e.target.value)}
                />
                <Input
                type="number"
                placeholder={t('notificationsPage.priceAlerts.pricePlaceholder')}
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleAddAlert('above')} className='flex-1'>
                <ArrowUp className="mr-2 h-4 w-4" /> {t('notificationsPage.priceAlerts.notifyAbove')}
            </Button>
            <Button onClick={() => handleAddAlert('below')} className='flex-1' variant='secondary'>
                <ArrowDown className="mr-2 h-4 w-4" /> {t('notificationsPage.priceAlerts.notifyBelow')}
            </Button>
          </div>
        </div>
        
        <h4 className="font-medium mb-2 text-muted-foreground">{t('notificationsPage.priceAlerts.activeAlerts')}</h4>
        <div className="space-y-2">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('notificationsPage.priceAlerts.noActiveAlerts')}</p>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <span className="font-semibold">{alert.crop}</span>
                    <span className="text-muted-foreground">
                        {alert.condition === 'above' ? ' > ' : ' < '}
                    </span>
                     ₹{alert.threshold.toLocaleString()}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveAlert(alert.id)}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Dummy Label component for compilation
const Label: React.FC<React.HTMLProps<HTMLLabelElement>> = (props) => <label {...props} />;
