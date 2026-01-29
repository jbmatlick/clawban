/**
 * Main Kanban board component
 */

import { useState, useMemo } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import type { TaskStatus, TaskAssignee, BoardType } from '../../../contracts/types';
import { KanbanColumn } from './KanbanColumn';
import { useTasks, useMoveTask } from '../api/hooks';
import { Loader2, X } from 'lucide-react';
import { cn } from '../utils/cn';

const COLUMNS: Array<{ status: TaskStatus; title: string; color: string }> = [
  { status: 'new', title: 'New', color: 'bg-blue-500' },
  { status: 'approved', title: 'Approved', color: 'bg-green-500' },
  { status: 'in-progress', title: 'In Progress', color: 'bg-orange-500' },
  { status: 'complete', title: 'Complete', color: 'bg-purple-500' },
];

type FilterType = 'all' | 'rufus' | 'james' | 'unassigned';

export function KanbanBoard() {
  const [board, setBoard] = useState<BoardType>('work');
  const [filter, setFilter] = useState<FilterType>('all');
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  
  // Determine assignee filter for API call
  const assigneeFilter: TaskAssignee | undefined = 
    filter === 'all' ? undefined :
    filter === 'unassigned' ? null :
    filter;
  
  const { data, isLoading, error } = useTasks(assigneeFilter, tagFilter, board);
  const moveTask = useMoveTask();
  
  // Extract unique tags from all tasks
  const availableTags = useMemo(() => {
    if (!data?.tasks) return [];
    const tags = new Set<string>();
    data.tasks.forEach(task => {
      task.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [data?.tasks]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const newStatus = destination.droppableId as TaskStatus;

    moveTask.mutate({
      id: draggableId,
      request: { status: newStatus },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive font-medium">Failed to load tasks</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  const tasks = data?.tasks || [];

  return (
    <>
      {/* Board Tabs */}
<div className="flex gap-4 mb-4">
  <button
    onClick={() => setBoard('work')}
    className={cn(
      'px-4 py-2 rounded-lg font-medium transition-colors',
      board === 'work'
        ? 'bg-primary text-primary-foreground'
        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
    )}
  >
    🧑‍💼 Work
  </button>
  <button
    onClick={() => setBoard('personal')}
    className={cn(
      'px-4 py-2 rounded-lg font-medium transition-colors',
      board === 'personal'
        ? 'bg-primary text-primary-foreground'
        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
    )}
  >
    🏡 Personal
  </button>
</div>
      <div className="space-y-3 mb-4">
        {/* Assignee Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground flex items-center py-2">
            Assignee:
          </span>
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilter('james')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'james'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            👤 My Tasks
          </button>
          <button
            onClick={() => setFilter('rufus')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'rufus'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            🤖 Rufus's Tasks
          </button>
          <button
            onClick={() => setFilter('unassigned')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'unassigned'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            📋 Unassigned
          </button>
        </div>

        {/* Tag Filters */}
        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground flex items-center py-2">
              Tags:
            </span>
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? undefined : tag)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
                  tagFilter === tag
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                🏷️ {tag}
                {tagFilter === tag && <X className="w-3 h-3" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-16rem)]">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.status}
              status={column.status}
              title={column.title}
              tasks={tasks.filter((task) => task.status === column.status)}
              color={column.color}
            />
          ))}
        </div>
      </DragDropContext>
    </>
  );
}
