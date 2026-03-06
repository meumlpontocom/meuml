import React from "react";
import { useDispatch } from "react-redux";
import {
  saveAdvertId,
  saveAccountId,
} from "../../../../redux/actions/_highQualityActions";

export default function EditHighQualityProps({
  history,
  id,
  accountId,
}) {
  const dispatch = useDispatch();

  function handleClick() {
    dispatch(saveAdvertId(id));
    dispatch(saveAccountId(accountId));
    history.push("/editar-para-alta-qualidade");
  }

  return (
    <div className="dropdown-item" onClick={handleClick}>
      Editar alta qualidade
    </div>
  );
}
