import React, { useMemo } from "react";
import Button from "reactstrap/lib/Button";
import { publishMultipleAdverts } from "../requests";
import { useSelector, useDispatch } from "react-redux";
import { DropDown } from "../../../../../components/buttons/ButtonGroup";
import Swal from "sweetalert2";

export default function BulkOptions() {
  const dispatch = useDispatch();
  const { advertising } = useSelector((state) => state.catalog);
  const { accounts } = useSelector((state) => state.accounts);
  const selectedAdverts = useMemo(() => {
    let selected = [];
    for (const id in advertising) {
      if (advertising[id].selected) selected.push(advertising[id]);
    }
    return selected;
  }, [advertising]);

  const subscriptionValidation = useMemo(() => {
    let allowed = [];
    let notAllowed = [];
    selectedAdverts.forEach((advert) => {
      const advertOwner = advert["account_id"];
      if (
        accounts[advertOwner].permissions.modules_id.find(
          (module) => module === 6
        )
      ) {
        allowed.push(advert);
      } else notAllowed.push(advert);
    });
    return {
      allowed,
      notAllowed,
    };
  }, [selectedAdverts, accounts]);

  function subscriptionAdvise() {
    const { notAllowed, allowed } = subscriptionValidation;
    if (notAllowed.length && allowed.length) {
      Swal.fire({
        title: "Atenção",
        type: "warning",
        text: `<p>${notAllowed.length} serão ignorados devido a ausência de assinatura nas contas responsáveis.</p>`,
        showCloseButton: true,
      }).then((user) => {
        if (user.value)
          publishMultipleAdverts({ dispatch, subscriptionValidation });
      });
    } else if (!allowed.length) {
      Swal.fire({
        title: "Atenção",
        type: "error",
        text: `<p>Todos os anúncios selecionados serão ignorados devido a ausência de assinatura nas contas responsáveis.</p>`,
        showCloseButton: true,
      });
    } else publishMultipleAdverts({ dispatch, subscriptionValidation });
  }

  function publishMultipleAds() {
    subscriptionAdvise();
  }

  return (
    <DropDown
      caret={true}
      direction="bottom"
      title={
        <>
          <i className="cil-cog mr-1" />
          <span>Ações em Massa</span>
        </>
      }
    >
      <Button
        disabled={!selectedAdverts.length}
        className="dropdown-item"
        style={{ cursor: "pointer" }}
        onClick={publishMultipleAds}
      >
        Publicar Anúncios Selecionados em Catálogo
      </Button>
    </DropDown>
  );
}
