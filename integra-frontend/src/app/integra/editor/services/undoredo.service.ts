import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable({
  providedIn: 'root',
})
export class UndoRedoService {
  private undoStack: Action[] = [];
  private redoStack: Action[] = [];

  constructor() {}

  // Record an action (called after each significant diagram change)
  recordAction(action: Action): void {
    this.undoStack.push(action);
    this.redoStack = []; // Clear redo stack on new action
  }

  // Undo the last action
  undo(graph: joint.dia.Graph): void {
    const action = this.undoStack.pop();
    if (action) {
      this.applyReverseAction(action, graph);
      this.redoStack.push(action);
    }
  }

  // Redo the last undone action
  redo(graph: joint.dia.Graph): void {
    const action = this.redoStack.pop();
    if (action) {
      this.applyAction(action, graph);
      this.undoStack.push(action);
    }
  }

  // Apply an action to the diagram
  private applyAction(action: Action, graph: joint.dia.Graph): void {
    switch (action.type) {
      case 'ADD_ELEMENT':
        graph.addCell(action.element);
        break;
      case 'REMOVE_ELEMENT':
        const cellToRemove = graph.getCell(action.elementId!);
        if (cellToRemove) cellToRemove.remove();
        break;
      case 'UPDATE_ELEMENT':
        const cellToUpdate = graph.getCell(action.elementId!);
        if (cellToUpdate) cellToUpdate.attr(action.newAttrs!);
        break;
      case 'ADD_LINK':
        graph.addCell(action.link!);
        break;
      case 'REMOVE_LINK':
        const linkToRemove = graph.getCell(action.linkId!);
        if (linkToRemove) linkToRemove.remove();
        break;
    }
  }

  // Apply the reverse of an action to undo it
  private applyReverseAction(action: Action, graph: joint.dia.Graph): void {
    switch (action.type) {
      case 'ADD_ELEMENT':
        const addedElement = graph.getCell(action.elementId!);
        if (addedElement) addedElement.remove();
        break;
      case 'REMOVE_ELEMENT':
        graph.addCell(action.element!);
        break;
      case 'UPDATE_ELEMENT':
        const updatedElement = graph.getCell(action.elementId!);
        if (updatedElement) updatedElement.attr(action.oldAttrs!);
        break;
      case 'ADD_LINK':
        const addedLink = graph.getCell(action.linkId!);
        if (addedLink) addedLink.remove();
        break;
      case 'REMOVE_LINK':
        graph.addCell(action.link!);
        break;
    }
  }
}

// Define an Action interface to represent incremental changes
interface Action {
  type: 'ADD_ELEMENT' | 'REMOVE_ELEMENT' | 'UPDATE_ELEMENT' | 'ADD_LINK' | 'REMOVE_LINK';
  element?: joint.dia.Element;  // For add/remove element
  elementId?: string;           // For remove/update element
  oldAttrs?: joint.dia.Cell.Attributes; // For update element
  newAttrs?: joint.dia.Cell.Attributes; // For update element
  link?: joint.dia.Link;        // For add/remove link
  linkId?: string;              // For remove link
}
