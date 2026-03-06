import React, { useContext } from "react";
import { CButton } from "@coreui/react";
import { FaPlusCircle } from "react-icons/fa";
import creditsContext from "../creditsContext";

const BuyBtn = () => {
  const { setShowForm, isMobile } = useContext(creditsContext);
  function handleBuyBtnClick() {
    setShowForm(true);
  }
  return (
    <CButton
      className={isMobile && "btn-block"}
      size="lg"
      color="success"
      variant="outline"
      onClick={handleBuyBtnClick}
    >
      <FaPlusCircle />
      &nbsp;Comprar
    </CButton>
  );
};

export default BuyBtn;
