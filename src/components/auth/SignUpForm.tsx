
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
import { Separator } from '@/components/ui/separator';
import { useTransition } from 'react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from "firebase/firestore";

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  phone: z.string().optional(),
  location: z.string().min(1, { message: 'Location is required.'}),
  cropDetails: z.string().optional(),
  soilDetails: z.string().optional(),
});

export function SignUpForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      location: '',
      cropDetails: '',
      soilDetails: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
          const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
          const user = userCredential.user;

          await updateProfile(user, { displayName: values.name });

          await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              displayName: values.name,
              email: values.email,
              phone: values.phone || '',
              location: values.location,
              cropDetails: values.cropDetails || '',
              soilDetails: values.soilDetails || '',
              createdAt: new Date()
          });

          toast({
              title: 'Account Created',
              description: "We've created your account for you. Redirecting to dashboard...",
          });
          router.push('/dashboard');
          router.refresh();
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: 'Sign-up Failed',
              description: error.message,
          });
      }
    });
  }

  const handleGoogleSignIn = () => {
     startTransition(async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

             await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              createdAt: new Date()
            }, { merge: true }); // Merge to not overwrite existing data if user signs up with google after email.


            toast({
                title: 'Account Created',
                description: "We've created your account for you. Redirecting to dashboard...",
            });
            router.push('/dashboard');
            router.refresh();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Google Sign-up Failed',
                description: error.message,
            });
        }
     });
  };

  return (
    <>
      <Button variant="outline" className="w-full mb-4" onClick={handleGoogleSignIn} disabled={isPending}>
        <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
          <path
            fill="currentColor"
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.62-4.8 1.62-4.32 0-7.78-3.57-7.78-7.98s3.46-7.98 7.78-7.98c2.18 0 3.83.85 4.9 1.82l2.3-2.3C18.37 1.18 15.79 0 12.48 0 5.86 0 .5 5.36.5 12s5.36 12 11.98 12c3.13 0 5.6-1.04 7.4-2.82 1.88-1.88 2.53-4.4 2.53-6.75 0-.85-.08-1.55-.2-2.18H12.48z"
          />
        </svg>
        Sign up with Google
      </Button>
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
              <FormItem className="md:col-span-2">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="md:col-span-2 my-2" />
          <h3 className="md:col-span-2 text-sm font-medium text-muted-foreground">Farm Details</h3>
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Punjab, India" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cropDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Crops</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Wheat, Rice" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="soilDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soil Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Alluvial soil" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full md:col-span-2 mt-4" disabled={isPending}>
            {isPending ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </Form>
    </>
  );
}
