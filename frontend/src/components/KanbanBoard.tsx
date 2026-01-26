/**
 * Main Kanban board component
 */

import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import type { TaskStatus } from '../../../contracts/types';
import { KanbanColumn } from './KanbanColumn';
import { useTasks, useMoveTask } from '../api/hooks';
import { Loader2 } from 'lucide-react';

const COLUMNS: Array<{ status: TaskStatus; title: string; color: string }> = [
  { status: 'new', title: 'New', color: 'bg-blue-500' },
  { status: 'approved', title: 'Approved', color: 'bg-green-500' },
  { status: 'in-progress', title: 'In Progress', color: 'bg-orange-500' },
  { status: 'complete', title: 'Complete', color: 'bg-purple-500' },
];

export function KanbanBoard() {
  const { data, isLoading, error } = useTasks();
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
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
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
  );
}
