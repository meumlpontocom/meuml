const scrollViewToElementId = elementId => {
  const element = document.getElementById(elementId);
  element && element.scrollIntoView();
}

export default scrollViewToElementId;
