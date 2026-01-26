/**
 * Kanban column component
 */

import { Droppable, Draggable } from 'react-beautiful-dnd';
import type { Task, TaskStatus } from '../../../contracts/types';
import { TaskCard } from './TaskCard';
import { cn } from '../utils/cn';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
}

export function KanbanColumn({ status, title, tasks, color }: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full bg-muted/30 rounded-lg">
      {/* Column Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={cn('w-3 h-3 rounded-full', color)} />
          <h2 className="font-semibold text-foreground">{title}</h2>
          <span className="text-sm text-muted-foreground">({tasks.length})</span>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 p-4 space-y-3 overflow-y-auto min-h-[200px]',
              snapshot.isDraggingOver && 'bg-accent/50'
            )}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(snapshot.isDragging && 'opacity-50')}
                  >
                    <TaskCard task={task} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {tasks.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                No tasks in this column
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
