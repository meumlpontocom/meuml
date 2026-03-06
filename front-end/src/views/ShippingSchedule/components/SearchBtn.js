import React, { useContext } from "react";
import { toast } from "react-toastify";
import shippingScheduleTypes from "../shippingScheduleTypes";
import shippingScheduleContext from "../shippingScheduleContext";
import ButtonComponent from "src/components/ButtonComponent";

const SearchBtn = () => {
  const { selectedAccount, selectedScheduleTypes, getShippingSchedule } = useContext(shippingScheduleContext);

  function handleBtnClick() {
    const formError = [];
    !selectedAccount.id && formError.push("Selecione uma conta no menu de contas.");
    !selectedScheduleTypes.length && formError.push("Selecione uma ou mais modalidades de frete.");
    return formError.length
      ? toast(formError.join("\n"), {
          type: toast.TYPE.ERROR,
          position: "top-center",
          pauseOnHover: true,
          autoClose: formError.length * 4500,
        })
      : selectedScheduleTypes.forEach(type => {
          if (shippingScheduleTypes.find(t => t.id === type.id))
            getShippingSchedule({ accountId: selectedAccount.id, shippingType: type.id });
        });
  }

  return (
    <ButtonComponent
      title="Pesquisar"
      icon="cil-search"
      onClick={handleBtnClick}
      variant=""
      height="40px"
      width="100%"
    />
  );
};

export default SearchBtn;
