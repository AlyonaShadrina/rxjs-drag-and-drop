import { fromEvent } from 'rxjs';
import { takeUntil, switchMap, withLatestFrom } from 'rxjs/operators';

const draggable = document.querySelectorAll('.draggable');
const droppable = document.querySelectorAll('.droppable');

const mouseDown$ = fromEvent(draggable, 'mousedown');
const mouseUp$ = fromEvent(document, 'mouseup');
const mouseMove$ = fromEvent(document, 'mousemove');
const drop$ = fromEvent(droppable, 'mouseup');


const dragStart$ = mouseDown$;
const dragMove$ = dragStart$.pipe( // on every mousedown
  switchMap(() => mouseMove$.pipe( // on every mousemove
    takeUntil(mouseUp$) // until mouseup
  )),
);
const dragDrop$ = dragMove$.pipe(
  switchMap(() => drop$.pipe(
    takeUntil(mouseUp$) // until mouseup (hoists to document from droppable, so mouseUp triggers after drop)
  )),
);

dragMove$.subscribe(() => {
  window.getSelection().removeAllRanges(); // helps remove bugs when text selected
  // TODO: create visual clone of draggable element 
});
dragDrop$.pipe(
  withLatestFrom(mouseDown$),
).subscribe(([dropToElement, draggedElement]) => {
  dropToElement.target.closest('.droppable').appendChild(draggedElement.target)
});