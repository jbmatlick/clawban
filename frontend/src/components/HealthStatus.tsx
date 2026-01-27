/**
 * Gateway Health Status Component
 * Shows health indicator and restart button when unhealthy
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface HealthResponse {
  success: boolean;
  healthy: boolean;
  timestamp: string;
  gateway: string;
  error?: string;
}

export function HealthStatus() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  // Check health every 10 seconds
  const { data: health, isLoading } = useQuery<HealthResponse>({
    queryKey: ['gateway-health'],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/gateway/health`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to check health');
      }
      
      return response.json();
    },
    refetchInterval: 10000, // Check every 10 seconds
    retry: false,
    enabled: !!session?.access_token,
  });

  // Restart mutation
  const restartMutation = useMutation({
    mutationFn: async () => {
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/gateway/restart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to restart');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Gateway restart initiated', {
        description: 'The gateway will be back online in a few seconds',
      });
      
      // Refetch health after 5 seconds
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['gateway-health'] });
      }, 5000);
    },
    onError: (error) => {
      toast.error('Restart failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  const isHealthy = health?.healthy ?? true;
  const isRestarting = restartMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
        <Activity className="w-4 h-4 animate-pulse text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Checking...</span>
      </div>
    );
  }

  if (isHealthy) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-medium text-green-700 dark:text-green-400">
          Health OK
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10">
        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
        <span className="text-sm font-medium text-red-700 dark:text-red-400">
          Health Not OK
        </span>
      </div>
      
      <button
        onClick={() => restartMutation.mutate()}
        disabled={isRestarting}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Restart Gateway"
      >
        <RefreshCw className={`w-4 h-4 ${isRestarting ? 'animate-spin' : ''}`} />
        <span className="text-sm font-medium">
          {isRestarting ? 'Restarting...' : 'Restart'}
        </span>
      </button>
    </div>
  );
}
