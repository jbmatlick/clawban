/**
 * Main Kanban board component
 */

import { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import type { TaskStatus, TaskAssignee } from '../../../contracts/types';
import { KanbanColumn } from './KanbanColumn';
import { useTasks, useMoveTask } from '../api/hooks';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

const COLUMNS: Array<{ status: TaskStatus; title: string; color: string }> = [
  { status: 'new', title: 'New', color: 'bg-blue-500' },
  { status: 'approved', title: 'Approved', color: 'bg-green-500' },
  { status: 'in-progress', title: 'In Progress', color: 'bg-orange-500' },
  { status: 'complete', title: 'Complete', color: 'bg-purple-500' },
];

type FilterType = 'all' | 'rufus' | 'james' | 'unassigned';

export function KanbanBoard() {
  const [filter, setFilter] = useState<FilterType>('all');
  
  // Determine assignee filter for API call
  const assigneeFilter: TaskAssignee | undefined = 
    filter === 'all' ? undefined :
    filter === 'unassigned' ? null :
    filter;
  
  const { data, isLoading, error } = useTasks(assigneeFilter);
  const moveTask = useMoveTask();

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
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
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
