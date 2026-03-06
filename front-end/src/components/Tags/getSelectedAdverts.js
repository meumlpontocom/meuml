/* eslint-disable import/no-anonymous-default-export */
export default function (state) {
  const { selectedAdverts } = state;
  const { advertsArray, allChecked } = selectedAdverts;

  const location = window.location.href.split("#/")[1];
  if (location.includes("anuncios")) {
    const list = Object.values(advertsArray)
      .filter(ad => !ad.checked)
      .map(ad => ad.id);

    if (allChecked) {
      return {
        list,
        selectAll: true,
      };
    }

    const advertArrays = Object.values(advertsArray)
      .filter(advert => advert.checked)
      .map(ad => ad.id);

    return {
      list: advertArrays,
      selectAll: allChecked,
    };
  }

  return {
    list: [],
    selectAll: false,
  };
}
