/**
 * Edit Task Modal
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Task, ModelStrategy } from '../../../contracts/types';
import { useUpdateTask } from '../api/hooks';

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
}

export function EditTaskModal({ task, onClose }: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [modelStrategy, setModelStrategy] = useState(task.model_strategy);
  const [assignee, setAssignee] = useState<string>(task.assignee || 'null');
  const [tags, setTags] = useState(task.tags.join(', '));
  
  const updateTask = useUpdateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateTask.mutate(
      {
        id: task.id,
        request: {
          title,
          description,
          model_strategy: modelStrategy,
          assignee: assignee === 'null' ? null : assignee as 'rufus' | 'james',
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        },
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background min-h-[100px]"
              required
            />
          </div>

          {/* Model Strategy */}
          <div>
            <label className="block text-sm font-medium mb-1">Model Strategy</label>
            <select
              value={modelStrategy}
              onChange={(e) => setModelStrategy(e.target.value as ModelStrategy)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="opus-planning">Opus Planning</option>
              <option value="opus-coding">Opus Coding</option>
              <option value="sonnet-coding">Sonnet Coding</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium mb-1">Assignee</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="null">Unassigned</option>
              <option value="rufus">🤖 Rufus</option>
              <option value="james">👤 James</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="security, chatb2b, authentication"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateTask.isPending}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {updateTask.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
