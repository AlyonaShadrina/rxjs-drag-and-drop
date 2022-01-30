import { DOMClasses } from './config';

const sortDataByStatus = (array) => {
  return array.reduce((accumulator, currentItem) => {
    accumulator[currentItem.status] ? accumulator[currentItem.status].push(currentItem) : accumulator[currentItem.status] = [currentItem];
    return accumulator;
  }, {});
}
const createColumnElement = (columnTitle) => {
  const columnTitleElement = document.createElement('header');
  columnTitleElement.innerText = columnTitle;
  const result = document.createElement('section');
  result.classList.add(DOMClasses.dataContainerColumn, DOMClasses.droppable);
  result.appendChild(columnTitleElement);
  return result;
};
const createTodoItemElement = (todoItemObject) => {
  const result = document.createElement('div');
  result.classList.add('data-container__card', DOMClasses.draggable);
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
    const columnElement = createColumnElement(status);
    const todoItemsFragment = createTodoItemsElementsFragment(sortedByStatusData[status]);
    columnElement.appendChild(todoItemsFragment);
    accumulator.appendChild(columnElement);
    return accumulator;
  }), document.createDocumentFragment())
};
const mapDataToDOM = (todoItemsArray) => {
  const container = document.querySelector(`.${DOMClasses.dataContainer}`);
  const sortedByStatusData = sortDataByStatus(todoItemsArray);
  const columnsFragment = createColumnsElementsFragment(sortedByStatusData);
  container.appendChild(columnsFragment);
};

export default mapDataToDOM;
