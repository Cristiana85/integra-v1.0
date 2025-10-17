import { createReducer, on } from '@ngrx/store';
import * as DiagramActions from '../actions/diagram.actions';
import { DiagramState } from '../states/diagram.state';

export interface HistoryState {
  past: DiagramState[];
  present: DiagramState;
  future: DiagramState[];
}

const initialState: HistoryState = {
  past: [],
  present: { elements: [], links: [], selectedElementId: null },
  future: [],
};

export const diagramReducer = createReducer(
  initialState,

  // Add Element
  on(DiagramActions.addElement, (state, { element }) => {
    const newState = {
      ...state.present,
      elements: [...state.present.elements, element],
    };
    return {
      past: [...state.past, state.present],
      present: newState,
      future: [],
    };
  }),

  // Remove Element
  on(DiagramActions.removeElement, (state, { elementId }) => {
    const newState = {
      ...state.present,
      elements: state.present.elements.filter((el) => el.id !== elementId),
      links: state.present.links.filter(
        (link) => link.sourceId !== elementId && link.targetId !== elementId
      ),
    };
    return {
      past: [...state.past, state.present],
      present: newState,
      future: [],
    };
  }),

  // Update Element
  on(DiagramActions.updateElement, (state, { element }) => {
    const newState = {
      ...state.present,
      elements: state.present.elements.map((el) =>
        el.id === element.id ? { ...el, ...element } : el
      ),
    };
    return {
      past: [...state.past, state.present],
      present: newState,
      future: [],
    };
  }),

  // Undo
  on(DiagramActions.undo, (state) => {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, -1);
    return {
      past: newPast,
      present: previous,
      future: [state.present, ...state.future],
    };
  }),

  // Redo
  on(DiagramActions.redo, (state) => {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    return {
      past: [...state.past, state.present],
      present: next,
      future: newFuture,
    };
  })
);
