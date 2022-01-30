import { fromEvent, merge, from } from 'rxjs';
import { takeUntil, switchMap, withLatestFrom, bufferCount, map, sequenceEqual, mergeMap, filter } from 'rxjs/operators';

import visualCloneHandlers from './visualCloneHandlers';
import { DOMClasses } from '../config';

const hoveredClass = DOMClasses.dataContainerColumnHighlighted;

const addDragAndDropEventListeners = () => {

const draggable = document.querySelectorAll(`.${DOMClasses.draggable}`);
const droppable = document.querySelectorAll(`.${DOMClasses.droppable}`);

const mouseDownOnDraggable$ = fromEvent(draggable, 'mousedown');
const mouseUpOnDocument$ = fromEvent(document, 'mouseup');
const mouseUpWindow$ = fromEvent(window, 'mouseup');
const mouseMoveOnDocument$ = fromEvent(document, 'mousemove');
const mouseMoveOnDroppable$ = fromEvent(droppable, 'mousemove');
const mouseUpOnDroppable$ = fromEvent(droppable, 'mouseup');

const dragMove$ = mouseDownOnDraggable$.pipe( // on every mousedown
  switchMap(() => mouseMoveOnDocument$.pipe( // on every mousemove
    takeUntil(mouseUpOnDocument$) // until mouseup
  )),
);
const dragDrop$ = dragMove$.pipe( // on every drag move
  switchMap(() => mouseUpOnDroppable$.pipe( // catch every mouseup on droppable
    takeUntil(mouseUpOnDocument$) // until mouseup (hoists to document from droppable, so mouseUp triggers after drop)
  )),
);
const dragMouseUp$ = dragMove$.pipe( // on every drag move
  switchMap(() => mouseUpOnDocument$.pipe( // catch every mouseup on document
    takeUntil(mouseUpWindow$) // until mouseup on window (hoists to window from document)
  )),
);
const dragStart$ = merge(mouseDownOnDraggable$, mouseMoveOnDocument$).pipe( // on every draggable mouse down and document mouse move
  map(e => e.type), // get event type
  bufferCount(2, 1), // get two events
  mergeMap(
    last2 => from(last2).pipe(sequenceEqual(from(['mousedown','mousemove']))), // check sequence of 'mousedown' + 'mousemove'
  ),
  filter(bool => bool), // get only 'mousedown' + 'mousemove' events
);
const dragMoveOnDroppable$ = dragMove$.pipe( // on every drag move
  switchMap(() => mouseMoveOnDroppable$.pipe( // catch every mouseup on droppable
    takeUntil(mouseUpOnDocument$) // until mouseup
  )),
);

// create visually draggable clone on dragstart
dragStart$.pipe(
  withLatestFrom(mouseDownOnDraggable$),
).subscribe(([_, mouseDownEvent]) => {
  visualCloneHandlers.addCloneToDocument(mouseDownEvent.target.cloneNode(true));
});
// update position of visually draggable clone on dragmove
dragMove$.subscribe((moveEvent) => {
  window.getSelection().removeAllRanges(); // helps remove bugs when text selected
  visualCloneHandlers.updateClonePosition(moveEvent);
});
// remove visually draggable clone on dragmouseup
dragMouseUp$.subscribe(() => {
  visualCloneHandlers.removeCloneFromDocument();
  droppable.forEach(el => el.classList.remove(hoveredClass));
});
// highlight potential droppable target on hover drag
dragMoveOnDroppable$.subscribe((mouseMoveEvent) => {
  droppable.forEach(el => el.classList.remove(hoveredClass));
  mouseMoveEvent.target.closest(`.${DOMClasses.droppable}`).classList.add(hoveredClass);
});
// move draggable element to target droppable on drop
dragDrop$.pipe(
  withLatestFrom(mouseDownOnDraggable$),
).subscribe(([dropToElement, draggedElement]) => {
  dropToElement.target.closest(`.${DOMClasses.droppable}`).appendChild(draggedElement.target)
});

};

export default addDragAndDropEventListeners;
