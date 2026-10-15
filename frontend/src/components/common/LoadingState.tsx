import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
