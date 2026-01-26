/**
 * Task card component for Kanban board
 */

import { Trash2, DollarSign, Cpu } from 'lucide-react';
import type { Task } from '../../../contracts/types';
import { cn } from '../utils/cn';
import { useDeleteTask } from '../api/hooks';

interface TaskCardProps {
  task: Task;
}

const MODEL_STRATEGY_LABELS: Record<Task['model_strategy'], string> = {
  'opus-planning': 'Opus Planning',
  'opus-coding': 'Opus Coding',
  'sonnet-coding': 'Sonnet Coding',
  mixed: 'Mixed',
};

const MODEL_STRATEGY_COLORS: Record<Task['model_strategy'], string> = {
  'opus-planning': 'bg-purple-100 text-purple-700',
  'opus-coding': 'bg-blue-100 text-blue-700',
  'sonnet-coding': 'bg-green-100 text-green-700',
  mixed: 'bg-orange-100 text-orange-700',
};

export function TaskCard({ task }: TaskCardProps) {
  const deleteTask = useDeleteTask();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(task.id);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-card-foreground line-clamp-2">{task.title}</h3>
        <button
          onClick={handleDelete}
          className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
          aria-label="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{task.description}</p>

      {/* Model Strategy */}
      <div className="mb-3">
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
            MODEL_STRATEGY_COLORS[task.model_strategy]
          )}
        >
          <Cpu className="w-3 h-3" />
          {MODEL_STRATEGY_LABELS[task.model_strategy]}
        </span>
      </div>

      {/* Costs */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          <span>${task.estimated_dollar_cost.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{task.estimated_token_cost.toLocaleString()} tokens</span>
        </div>
      </div>

      {/* Completed timestamp */}
      {task.completed_at && (
        <div className="mt-2 text-xs text-muted-foreground">
          Completed {new Date(task.completed_at).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
