const cloneContainer = document.querySelector('#clone-container');

const visualCloneHandlers = {
  _clonedNode: null,
  addCloneToDocument(clonedNode) {
    this._clonedNode = cloneContainer.appendChild(clonedNode);
    this._clonedNode.style.position = 'absolute';
    this._clonedNode.style.top = `0px`;
    this._clonedNode.style.left = `0px`;
  },
  removeCloneFromDocument() {
    cloneContainer.removeChild(this._clonedNode);
  },
  updateClonePosition(moveEvent) {
    this._clonedNode.style.transform = `translate(${moveEvent.pageX}px, ${moveEvent.pageY}px)`;
  },
};

export default visualCloneHandlers;
