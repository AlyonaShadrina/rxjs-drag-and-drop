import { fromEvent, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, switchMap } from 'rxjs/operators';

import mapDataToDOM from './mapDataToDOM';
import addDragAndDropEventListeners from './dragAndDrop/addDragAndDropEventListeners';

const windowLoaded$ = fromEvent(window, 'load');
const todos = ajax({
  url: 'http://localhost:3000/todos',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
}).pipe(
  catchError(error => {
    console.log('error: ', error);
    return of(error);
  })
);

windowLoaded$.pipe(
  switchMap(() => todos)
).subscribe(({ response }) => {
  mapDataToDOM(response);
  addDragAndDropEventListeners();
})
