'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

const NOTIFICATION_SETTINGS_KEY = 'agriVision-weatherAlerts';

type WeatherAlertSettings = {
  rain: boolean;
  frost: boolean;
  highWind: boolean;
};

export function WeatherAlertsCard() {
  const [settings, setSettings] = useState<WeatherAlertSettings>({
    rain: false,
    frost: false,
    highWind: false,
  });
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const storedSettings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const handleSettingChange = (key: keyof WeatherAlertSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
    toast({
      title: t('notificationsPage.settingsSaved'),
      description: `${t(`notificationsPage.weatherAlerts.${key}`)} ${value ? t('notificationsPage.enabled') : t('notificationsPage.disabled')}.`,
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notificationsPage.weatherAlerts.title')}</CardTitle>
        <CardDescription>{t('notificationsPage.weatherAlerts.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2 p-3 rounded-lg bg-secondary/50">
          <Label htmlFor="rain-alert" className="font-normal">{t('notificationsPage.weatherAlerts.rain')}</Label>
          <Switch
            id="rain-alert"
            checked={settings.rain}
            onCheckedChange={(value) => handleSettingChange('rain', value)}
          />
        </div>
        <div className="flex items-center justify-between space-x-2 p-3 rounded-lg bg-secondary/50">
          <Label htmlFor="frost-alert" className="font-normal">{t('notificationsPage.weatherAlerts.frost')}</Label>
          <Switch
            id="frost-alert"
            checked={settings.frost}
            onCheckedChange={(value) => handleSettingChange('frost', value)}
          />
        </div>
        <div className="flex items-center justify-between space-x-2 p-3 rounded-lg bg-secondary/50">
          <Label htmlFor="high-wind-alert" className="font-normal">{t('notificationsPage.weatherAlerts.highWind')}</Label>
          <Switch
            id="high-wind-alert"
            checked={settings.highWind}
            onCheckedChange={(value) => handleSettingChange('highWind', value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
