import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { toggleModalIsOpen } from "../../redux/actions/_tagsActions";
import ButtonComponent from "../ButtonComponent";
import getSelectedAdverts from "./getSelectedAdverts";
import TagModal from "./Modal";
import requests from "./requests";

export default function ModalBtn() {
  const dispatch = useDispatch();
  const adverts = useSelector(getSelectedAdverts);
  const selectedAdverts = useSelector(state => state.selectedAdverts);

  const selectedAds = Object.values(selectedAdverts.advertsArray).filter(ad => ad.checked);
  const selectedAdsIds = { list: selectedAds.map(ad => ad.id) };
  const selectedAll = selectedAds.allChecked;
  const pagesAllChecked = selectedAds.pagesAllChecked;

  function createNewTag() {
    // if (adverts.list.length || adverts.selectAll) {
    if (selectedAds.length || selectedAll || pagesAllChecked) {
      requests.getTagsFromAdvertise({
        dispatch,
        advertiseId: selectedAdsIds,
      });
      toggleModal();
    } else alertSelectAtLeastOneAdvert();
  }

  const toggleModal = () => dispatch(toggleModalIsOpen());

  return (
    <>
      <ButtonComponent
        onClick={createNewTag}
        title="Tags de Anúncios"
        icon="cil-tags"
        color="warning"
        width="100%"
        // disabled={!(adverts.list.length || adverts.selectAll)}
        disabled={!selectedAds.length && !selectedAll && !pagesAllChecked}
      />
      {/* <TagModal selectAll={adverts} selectedAdvertsIds={adverts} /> */}
      <TagModal selectAll={adverts} selectedAdvertsIds={adverts} />
    </>
  );
}

const alertSelectAtLeastOneAdvert = () => {
  const alertConfig = {
    title: "Por favor,",
    text: "Selecione ao menos um anúncio para criar uma ou mais tags.",
    type: "warning",
    showCloseButton: true,
  };
  Swal.fire(alertConfig);
};
