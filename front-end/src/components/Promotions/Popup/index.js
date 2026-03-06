/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import PromotionsPopUpModalStyles from "./styles";
import PromotionDate from "./PromotionDate";
import PromotionTitle from "./PromotionTitle";
import SplitPercentage from "./SplitPercentage";
import StockConditions from "./StockConditions";
import { CButton, CModal, CModalHeader, CModalBody, CModalFooter, CLabel, CInput } from "@coreui/react";

const PopUp = ({ isPopUpOpen, togglePopUpOpen, selectedPromotion }) => {
  const [isActivatePromotion, setIsActivatePromotion] = useState(false);
  const toggleModalIsOpen = () => togglePopUpOpen(currentState => !currentState);
  const toggleActivatePromotion = () => setIsActivatePromotion(currentState => !currentState);
  useEffect(() => setIsActivatePromotion(selectedPromotion.status === "active"), []);
  return (
    <PromotionsPopUpModalStyles>
      <CModal centered show={isPopUpOpen} closeOnBackdrop={false} onClose={toggleModalIsOpen}>
        <CModalHeader closeButton>
          <PromotionTitle name={selectedPromotion.promotion_name} />
        </CModalHeader>
        <CModalBody>
          <h5 className="mb-3">{selectedPromotion.promotion_type_name}</h5>
          <PromotionDate label={"Data de início:"} date={selectedPromotion.promotion_start_date} />
          <PromotionDate label={"Data de término:"} date={selectedPromotion.promotion_finish_date} />
          <SplitPercentage type="seller" value={selectedPromotion.seller_percentage} />
          <SplitPercentage type="meli" value={selectedPromotion.meli_percentage} />
          <StockConditions max={selectedPromotion.stock_max} min={selectedPromotion.stock_min} />
          <div className="custom-control custom-switch" onClick={toggleActivatePromotion}>
            <CInput
              type="checkbox"
              className="custom-control-input"
              id="activate-promotion"
              checked={isActivatePromotion}
            />
            <CLabel className="custom-control-label" htmlFor="activate-promotion">
              Ativar essa promoção
            </CLabel>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary">Salvar</CButton>
          <CButton color="secondary" onClick={toggleModalIsOpen}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </PromotionsPopUpModalStyles>
  );
};

export default PopUp;
