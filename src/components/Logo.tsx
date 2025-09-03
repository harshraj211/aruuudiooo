import { Leaf } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-primary ${className}`}>
      <Leaf className="h-6 w-6" />
      <span className="font-headline text-xl font-bold tracking-tight">eKheti</span>
    </div>
  );
}
