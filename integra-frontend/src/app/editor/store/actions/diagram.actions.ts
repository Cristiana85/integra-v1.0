import { createAction, props } from '@ngrx/store';
import { ElementState, LinkState } from '../states/diagram.state';

// Add Element
export const addElement = createAction(
  '[Diagram] Add Element',
  props<{ element: ElementState }>()
);

// Remove Element
export const removeElement = createAction(
  '[Diagram] Remove Element',
  props<{ elementId: string }>()
);

// Update Element
export const updateElement = createAction(
  '[Diagram] Update Element',
  props<{ element: Partial<ElementState> & { id: string } }>()
);

// Add Link
export const addLink = createAction(
  '[Diagram] Add Link',
  props<{ link: LinkState }>()
);

// Remove Link
export const removeLink = createAction(
  '[Diagram] Remove Link',
  props<{ linkId: string }>()
);

// Undo
export const undo = createAction('[Diagram] Undo');

// Redo
export const redo = createAction('[Diagram] Redo');
