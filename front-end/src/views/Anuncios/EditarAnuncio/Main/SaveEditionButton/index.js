import React from "react";
import Button from "reactstrap/lib/Button";
import { useDispatch, useSelector } from "react-redux";
import requests from "../requests";

const SaveEditionButton = ({ advertId, history }) => {
  const dispatch = useDispatch();
  const { form } = useSelector((state) => state.editAdvert);

  function handleClick() {
    requests.putAdvert({ dispatch, advertId, form, history });
  }

  return (
    <Button color="success" onClick={handleClick} className="mt-2 mt-sm-0">
      <i className="cil-check mr-1" />
      Salvar
    </Button>
  );
};

export default SaveEditionButton;
