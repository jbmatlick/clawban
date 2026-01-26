/**
 * Form for creating new tasks
 */

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { CreateTaskRequest, ModelStrategy } from '../../../contracts/types';
import { useCreateTask } from '../api/hooks';
import { cn } from '../utils/cn';

const MODEL_STRATEGIES: Array<{ value: ModelStrategy; label: string }> = [
  { value: 'opus-planning', label: 'Opus Planning' },
  { value: 'opus-coding', label: 'Opus Coding' },
  { value: 'sonnet-coding', label: 'Sonnet Coding' },
  { value: 'mixed', label: 'Mixed' },
];

export function CreateTaskForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    model_strategy: 'sonnet-coding',
    estimated_token_cost: 0,
    estimated_dollar_cost: 0,
  });

  const createTask = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createTask.mutate(formData, {
      onSuccess: () => {
        setFormData({
          title: '',
          description: '',
          model_strategy: 'sonnet-coding',
          estimated_token_cost: 0,
          estimated_dollar_cost: 0,
        });
        setIsOpen(false);
      },
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
      >
        <Plus className="w-5 h-5" />
        New Task
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Create New Task</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            required
            maxLength={200}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={4}
            required
          />
        </div>

        {/* Model Strategy */}
        <div>
          <label htmlFor="model_strategy" className="block text-sm font-medium mb-1">
            Model Strategy
          </label>
          <select
            id="model_strategy"
            value={formData.model_strategy}
            onChange={(e) =>
              setFormData({ ...formData, model_strategy: e.target.value as ModelStrategy })
            }
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {MODEL_STRATEGIES.map((strategy) => (
              <option key={strategy.value} value={strategy.value}>
                {strategy.label}
              </option>
            ))}
          </select>
        </div>

        {/* Costs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="token_cost" className="block text-sm font-medium mb-1">
              Estimated Tokens
            </label>
            <input
              id="token_cost"
              type="number"
              value={formData.estimated_token_cost}
              onChange={(e) =>
                setFormData({ ...formData, estimated_token_cost: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="dollar_cost" className="block text-sm font-medium mb-1">
              Estimated Cost ($)
            </label>
            <input
              id="dollar_cost"
              type="number"
              step="0.01"
              value={formData.estimated_dollar_cost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estimated_dollar_cost: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              min="0"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={createTask.isPending}
            className={cn(
              'flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-colors',
              createTask.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'
            )}
          >
            {createTask.isPending ? 'Creating...' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
