import { useState, type DragEvent } from 'react';

export type DragHandlers = {
  className: string | undefined;
  draggable: true;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent) => void;
  onDragStart: () => void;
  onDrop: (event: DragEvent) => void;
};

/**
 * Drag to reorder, with the arrow buttons left in place beside it.
 *
 * Dragging is the fast way and the keyboard is the only way for some people, so
 * neither replaces the other. The list itself is never mutated here — the hook
 * reports "move this index to that one" and the caller decides what that means.
 */
export function useReorder(onMove: (from: number, to: number) => void) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  return (index: number): DragHandlers => ({
    className:
      dragging === index ? 'dragging' : over === index && dragging !== null ? 'drop-target' : undefined,
    draggable: true,
    onDragEnd: () => {
      setDragging(null);
      setOver(null);
    },
    onDragOver: (event) => {
      event.preventDefault();
      setOver(index);
    },
    onDragStart: () => setDragging(index),
    onDrop: (event) => {
      event.preventDefault();
      if (dragging !== null) {
        onMove(dragging, index);
      }
      setDragging(null);
      setOver(null);
    },
  });
}
