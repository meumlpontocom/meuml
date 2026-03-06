import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Redirect, useHistory } from "react-router-dom";
import ButtonComponent from "./ButtonComponent";

export default function ReplicateMlAdvertsBtn() {
  const history = useHistory();
  const [state, setState] = useState({ redirect: false, from: null });
  const selectAll = useSelector(state => state.advertsReplication?.selectAll);
  const selectedAdverts = useSelector(state => state.advertsReplication?.selectedAdverts);

  const setRedirect = () => setState({ redirect: true, from: history.location?.pathname });

  if (state.redirect) {
    return <Redirect from={state.from} to={{ pathname: "/confirmar-replicacao-de-anuncios", state }} />;
  }

  return (
    <ButtonComponent
      onClick={() => setRedirect()}
      disabled={!selectedAdverts.length ? (!selectAll ? true : false) : false}
      title="Replicar selecionados"
      icon="cil-library-add"
      color="success"
      width="100%"
    />
  );
}
