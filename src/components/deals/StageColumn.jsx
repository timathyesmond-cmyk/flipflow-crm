import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import DealCard from './DealCard';
import { cn } from '@/lib/utils';

const stageConfig = {
  lead: { label: 'Leads', color: 'bg-muted', dot: 'bg-slate-400' },
  contacted: { label: 'Contacted', color: 'bg-primary/10', dot: 'bg-primary' },
  under_contract: { label: 'Under Contract', color: 'bg-amber-50', dot: 'bg-amber-400' },
  assigned: { label: 'Assigned', color: 'bg-blue-50', dot: 'bg-blue-400' },
  closed: { label: 'Closed', color: 'bg-emerald-50', dot: 'bg-emerald-500' },
  dead: { label: 'Dead', color: 'bg-red-50', dot: 'bg-red-400' },
};

export default function StageColumn({ stage, deals }) {
  const config = stageConfig[stage];

  return (
    <div className="min-w-[280px] max-w-[300px] flex-shrink-0 flex flex-col">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn("w-2.5 h-2.5 rounded-full", config.dot)} />
        <h3 className="text-sm font-semibold">{config.label}</h3>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 ml-auto">
          {deals.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 rounded-xl p-2 min-h-[120px] transition-colors duration-150 space-y-2",
              snapshot.isDraggingOver ? 'bg-accent/40 ring-2 ring-accent ring-inset' : config.color
            )}
          >
            {deals.map((deal, index) => (
              <Draggable key={deal.id} draggableId={deal.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      "rounded-lg transition-shadow",
                      snapshot.isDragging && "shadow-xl rotate-1 opacity-95"
                    )}
                  >
                    <DealCard deal={deal} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {deals.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-xl">
                Drop deals here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}