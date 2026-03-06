import React from 'react';

class RenderHandler {
  constructor({ array, prop, Component }) {
    this.array = array;
    this.prop = prop;
    this.Component = Component;
  }

  displayHelper() {
    return this.prop !== null ? this.Component : null;
  }
}

export function removeHiddenDivsFromDocument() {
  document.querySelectorAll("#toBeRemoved").forEach(element => {
    element.parentNode.removeChild(element);
  });
}

export function dataHandler({response, selected}) {
  const options = {
    "ID": "external_id",
    "Condição": "condition",
    "Tipo de anúncio": "listing_type",
    "Frete": "free_shipping"
  }
  if (response && selected) {
    let adverts = selected.map(option => {
      const prop = options[option];
      let attributes = response.map(advert => {
        let item = advert.attributes;
        item[prop] = null;
        return item;
      });
      return attributes;
    });
    return adverts[0];
  }
}

export default RenderHandler;