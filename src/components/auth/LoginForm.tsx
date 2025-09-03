'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(() => {
      // Mock login logic
      console.log('Logging in with:', values);
      toast({
        title: 'Login Successful',
        description: 'Redirecting to your dashboard...',
      });
      // In a real app, you'd call Firebase here.
      // e.g., await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push('/dashboard');
    });
  }

  const handleGoogleSignIn = () => {
    startTransition(() => {
      // Mock Google sign-in
      console.log('Signing in with Google...');
      toast({
        title: 'Login Successful',
        description: 'Redirecting to your dashboard...',
      });
      // In a real app, you'd call Firebase here.
      // e.g., await signInWithPopup(auth, new GoogleAuthProvider());
      router.push('/dashboard');
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="farmer@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Form>
      <div className="relative mt-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full mt-4" onClick={handleGoogleSignIn} disabled={isPending}>
        <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
          <path
            fill="currentColor"
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.62-4.8 1.62-4.32 0-7.78-3.57-7.78-7.98s3.46-7.98 7.78-7.98c2.18 0 3.83.85 4.9 1.82l2.3-2.3C18.37 1.18 15.79 0 12.48 0 5.86 0 .5 5.36.5 12s5.36 12 11.98 12c3.13 0 5.6-1.04 7.4-2.82 1.88-1.88 2.53-4.4 2.53-6.75 0-.85-.08-1.55-.2-2.18H12.48z"
          />
        </svg>
        Google
      </Button>
    </>
  );
}
