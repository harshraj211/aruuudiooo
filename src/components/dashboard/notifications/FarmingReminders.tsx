'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, BellRing, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const REMINDERS_KEY = 'agriVision-farmingReminders';

export type Reminder = {
  id: string;
  task: string;
  date: Date;
};

export function FarmingReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newDate, setNewDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const storedReminders = localStorage.getItem(REMINDERS_KEY);
    if (storedReminders) {
      setReminders(JSON.parse(storedReminders).map((r: Reminder) => ({ ...r, date: new Date(r.date) })));
    }
  }, []);

  const saveReminders = (newReminders: Reminder[]) => {
    setReminders(newReminders);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(newReminders));
  }

  const handleAddReminder = () => {
    if (!newTask || !newDate) {
      toast({
        variant: 'destructive',
        title: t('notificationsPage.reminders.addErrorTitle'),
        description: t('notificationsPage.reminders.addErrorDescription'),
      });
      return;
    }
    const newReminder: Reminder = {
      id: Date.now().toString(),
      task: newTask,
      date: newDate,
    };
    saveReminders([...reminders, newReminder].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setNewTask('');
    setNewDate(new Date());
    toast({
      title: t('notificationsPage.reminders.reminderSet'),
      description: `${t('notificationsPage.reminders.reminderFor')} "${newReminder.task}" ${t('notificationsPage.reminders.on')} ${format(newReminder.date, 'PPP')}.`,
    });
  };

  const handleRemoveReminder = (id: string) => {
    const newReminders = reminders.filter(reminder => reminder.id !== id);
    saveReminders(newReminders);
    toast({
      title: t('notificationsPage.reminders.reminderRemoved'),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notificationsPage.reminders.title')}</CardTitle>
        <CardDescription>{t('notificationsPage.reminders.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-2 items-end mb-6 p-4 border rounded-lg">
          <div className="grid flex-1 w-full gap-1.5">
            <Label>{t('notificationsPage.reminders.newTask')}</Label>
            <Input
              placeholder={t('notificationsPage.reminders.taskPlaceholder')}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
          </div>
          <div className="grid w-full md:w-auto gap-1.5">
             <Label>{t('notificationsPage.reminders.date')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full md:w-[240px] justify-start text-left font-normal", !newDate && "text-muted-foreground")}
                >
                  {newDate ? format(newDate, "PPP") : <span>{t('notificationsPage.reminders.pickDate')}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newDate}
                  onSelect={setNewDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleAddReminder} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> {t('notificationsPage.reminders.addReminder')}
          </Button>
        </div>
        
        <h4 className="font-medium mb-2 text-muted-foreground">{t('notificationsPage.reminders.upcomingReminders')}</h4>
        <div className="space-y-2">
          {reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('notificationsPage.reminders.noUpcomingReminders')}</p>
          ) : (
            reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <BellRing className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">{reminder.task}</p>
                    <p className="text-sm text-muted-foreground">{format(reminder.date, 'PPP')}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveReminder(reminder.id)}>
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
