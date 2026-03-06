import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetStore, toggleReplicateSelf } from "../../redux/actions/_replicationActions";
import ButtonComponent from "../ButtonComponent";
import Swal from "sweetalert2";

export default function ReplicateAdsBtn({
  history,
  type = "ml",
  title = "Replicar Anúncios",
  bgColor,
  textColor,
}) {
  const dispatch = useDispatch();
  const selectedAdvertsState = useSelector(state => state.selectedAdverts);
  const { advertsArray, allChecked } = selectedAdvertsState;
  const advertsMeta = useSelector(state => state.advertsMeta);

  const LIMIT_ADVERTS_SHOPEE_REPLICATION = 50;

  const disabledBtn = useMemo(() => {
    if (allChecked) return false;
    else if (
      Object.values(advertsArray)
        .filter(advert => advert.checked)
        .map(advert => advert.id).length
    )
      return false;
    else return true;
  }, [allChecked, advertsArray]);

  const activateSelfReplication = () => dispatch(toggleReplicateSelf());

  function handleClick() {
    activateSelfReplication();
    if (type === "ml") {
      history.push("/confirmar-replicacao-de-anuncios");
    } else {
      const selectedMoreThanShopeeLimit =
        advertsArray.length > LIMIT_ADVERTS_SHOPEE_REPLICATION ||
        (allChecked && advertsMeta.total > LIMIT_ADVERTS_SHOPEE_REPLICATION);

      if (selectedMoreThanShopeeLimit) {
        Swal.fire({
          title: "Atenção",
          text: `Você não pode replicar mais do que ${LIMIT_ADVERTS_SHOPEE_REPLICATION} anúncios de uma vez para a Shopee.`,
          type: "warning",
          showCloseButton: true,
        });
      } else {
        history.push("/confirmar-replicacao-de-anuncios-shopee");
      }
    }
  }

  useEffect(() => {
    dispatch(resetStore());
  }, []); //eslint-disable-line

  return (
    <ButtonComponent
      onClick={() => handleClick()}
      title={title}
      icon="cil-library-add"
      disabled={disabledBtn}
      variant=""
      bgColor={bgColor}
      textColor={textColor}
      width="100%"
    />
  );
}
