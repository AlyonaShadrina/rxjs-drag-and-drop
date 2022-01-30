import { fromEvent, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, switchMap, map, debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

import mapDataToDOM from './mapDataToDOM';
import addDragAndDropEventListeners from './dragAndDrop/addDragAndDropEventListeners';
import { DOMClasses } from './config';

const mapDataToDomAndAddListeners = (todoItemsArray) => {
  mapDataToDOM(todoItemsArray);
  addDragAndDropEventListeners();
}
const clearDataContainer = () => {
  const container = document.querySelector(`.${DOMClasses.dataContainer}`);
  container.innerHTML = '';
}
const updateDataInDom = (todoItemsArray) => {
  clearDataContainer();
  mapDataToDomAndAddListeners(todoItemsArray);
}

// request on load
const windowLoaded$ = fromEvent(window, 'load');
const todos$ = ajax({
  url: 'http://localhost:3000/todos',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});
windowLoaded$.pipe(
  switchMap(() => todos$)
).subscribe(({ response }) => {
  mapDataToDomAndAddListeners(response);
})

// request on search

const searchInputElement = document.querySelector('input');
const searchInputChanged$ = fromEvent(searchInputElement, 'input');
const searchTypeElement = document.querySelector('select');
const searchTypeChanged$ = fromEvent(searchTypeElement, 'input');

searchInputChanged$.pipe(
  map(event => event.target.value),
  debounceTime(500),
  distinctUntilChanged(),
  switchMap(value => ajax({
    url: `http://localhost:3000/todos?${value ? `${searchTypeElement.value}=${value}` : ''}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }))
).subscribe(({ response }) => {
  updateDataInDom(response);
})

searchTypeChanged$.pipe(
  filter(() => searchInputElement.value),
  switchMap(event => ajax({
    url: `http://localhost:3000/todos?${event.target.value}=${searchInputElement.value}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }))
).subscribe(({ response }) => {
  updateDataInDom(response);
})
