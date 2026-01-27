/**
 * Tag Badge Component
 * Displays a colored tag badge
 */

import { useQuery } from '@tanstack/react-query';
import type { Tag } from '../../../contracts/types';
import { useAuth } from '../contexts/AuthContext';

interface TagBadgeProps {
  name: string;
}

export function TagBadge({ name }: TagBadgeProps) {
  const { session } = useAuth();

  // Fetch all tags to get the color for this tag
  const { data: tagsResponse } = useQuery<{ success: boolean; data: Tag[] }>({
    queryKey: ['tags'],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tags`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      
      return response.json();
    },
    staleTime: 60000, // Cache for 1 minute
    enabled: !!session?.access_token,
  });

  const tag = tagsResponse?.data?.find(t => t.name === name);
  const color = tag?.color || '#6b7280'; // Default gray if tag not found

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {name}
    </span>
  );
}
