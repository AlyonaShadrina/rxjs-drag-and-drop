import { DOMClasses } from './config';

const sortDataByStatus = (array) => {
  return array.reduce((accumulator, currentItem) => {
    accumulator[currentItem.status] ? accumulator[currentItem.status].push(currentItem) : accumulator[currentItem.status] = [currentItem];
    return accumulator;
  }, {});
}
const createColumnElement = (columnTitle, columnCount) => {
  const columnTitleElement = document.createElement('header');
  columnTitleElement.innerText = columnTitle;
  const result = document.createElement('section');
  result.classList.add('col', DOMClasses.droppable);
  result.appendChild(columnTitleElement);
  return result;
};
const createTodoItemElement = (todoItemObject) => {
  const result = document.createElement('div');
  result.classList.add('card', DOMClasses.draggable);
  result.innerText = todoItemObject.title;
  return result;
};
const createTodoItemsElementsFragment = (todoItemsArray) => {
  return todoItemsArray.reduce((accumulator, currentItem) => {
    accumulator.appendChild(createTodoItemElement(currentItem));
    return accumulator;
  }, document.createDocumentFragment());
};
const createColumnsElementsFragment = (sortedByStatusData) => {
  const statusesArray = Object.keys(sortedByStatusData);
  return statusesArray.reduce(((accumulator, status) => {
    const columnElement = createColumnElement(status, statusesArray.length);
    const todoItemsFragment = createTodoItemsElementsFragment(sortedByStatusData[status]);
    columnElement.appendChild(todoItemsFragment);
    accumulator.appendChild(columnElement);
    return accumulator;
  }), document.createDocumentFragment())
};
const mapDataToDOM = (response) => {
  const container = document.querySelector('.row');
  const sortedByStatusData = sortDataByStatus(response);
  const columnsFragment = createColumnsElementsFragment(sortedByStatusData);
  container.appendChild(columnsFragment);
};

export default mapDataToDOM;
