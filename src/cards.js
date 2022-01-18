import { fromEvent, merge, from } from 'rxjs';
import { takeUntil, switchMap, withLatestFrom, bufferCount, map, sequenceEqual, mergeMap, filter } from 'rxjs/operators';

const draggable = document.querySelectorAll('.draggable');
const droppable = document.querySelectorAll('.droppable');

const mouseDownOnDraggable$ = fromEvent(draggable, 'mousedown');
const mouseUpOnDocument$ = fromEvent(document, 'mouseup');
const mouseUpWindow$ = fromEvent(window, 'mouseup');
const mouseMoveOnDocument$ = fromEvent(document, 'mousemove');
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

dragStart$.pipe(
  withLatestFrom(mouseDownOnDraggable$),
).subscribe(matched => console.log('create clone ', matched));
dragMove$.pipe(
  withLatestFrom(mouseDownOnDraggable$),
).subscribe(([moveEvent, mouseDownEvent]) => {
  window.getSelection().removeAllRanges(); // helps remove bugs when text selected
  // TODO: create visual clone of draggable element 
  // const clone = mouseDownEvent.target.cloneNode();
  console.log('update position:', moveEvent);
});
dragMouseUp$.subscribe((mouseUpEvent) => {
  console.log('clear container:', mouseUpEvent);
});
dragDrop$.pipe(
  withLatestFrom(mouseDownOnDraggable$),
).subscribe(([dropToElement, draggedElement]) => {
  dropToElement.target.closest('.droppable').appendChild(draggedElement.target)
});