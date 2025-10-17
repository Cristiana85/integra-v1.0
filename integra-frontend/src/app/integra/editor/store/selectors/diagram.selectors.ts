import { createSelector, createFeatureSelector } from '@ngrx/store';
import { HistoryState } from '../reducers/diagram.reducer';

const getDiagramHistory = createFeatureSelector<HistoryState>('diagram');

export const getPresentState = createSelector(
  getDiagramHistory,
  (state) => state.present
);

export const getElements = createSelector(
  getPresentState,
  (state) => state.elements
);

export const getLinks = createSelector(
  getPresentState,
  (state) => state.links
);

export const getSelectedElement = createSelector(
  getPresentState,
  (state) => state.elements.find((el) => el.id === state.selectedElementId)
);
