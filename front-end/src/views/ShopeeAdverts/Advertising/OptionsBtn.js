import { CCol } from "@coreui/react";
import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { DropDown } from "../../../components/buttons/ButtonGroup";

function OptionsBtn({ id }) {
  const history = useHistory();
  const advert = useSelector(({ shopee }) => shopee.advertising.list.filter(advert => advert.id === id)[0]);

  function handleMlReplicationClick() {
    history.push({
      pathname: "/replicar-anuncios-shopee/mercado-livre",
      state: { ...advert },
    });
  }
  return (
    <CCol xs="12" className="mt-1 mb-1">
      <DropDown
        size="sm"
        caret={true}
        color="primary"
        direction="bottom"
        title={
          <>
            <i className="cil-cog mr-1" />
            <span>Opções</span>
          </>
        }
      >
        <span className="dropdown-item" onClick={handleMlReplicationClick}>
          <i className="cui cui-cash mr-1" />
          Replicação Mercado Livre
        </span>
      </DropDown>
    </CCol>
  );
}

export default OptionsBtn;
