import React, { useState }                                         from "react"
import PropTypes                                                   from "prop-types"
import { applyPriceToWinConditions }                               from "../requests";
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader } from "@coreui/react";
import PriceToWinTip                                               from "./PriceToWinTip";
import ConditionsTable                                             from "./ConditionsTable";
import UpdatePublicationCondition                                  from "./UpdatePublicationCondition";

const Modal = ({
  show,
  advertId,
  priceToWin,
  selfBoosts,
  winnerPrice,
  currentPrice,
  winnerBoosts,
  setShowBoostsModal,
}) => {
  const [editingCondition, setEditingCondition] = useState(false);
  const [priceToWinForm, setPriceToWinForm] = useState({ price: currentPrice, no_interest: true, free_shipping: true });
  const handlePublicationUpdate = () => {
    if (editingCondition) applyPriceToWinConditions({ advertisingId: advertId, form: priceToWinForm });
    else setEditingCondition(true);
  }
  const closeModal = () => {
    setShowBoostsModal(false);
    setEditingCondition(false);
    setPriceToWinForm({ "price": currentPrice, "no_interest": true, "free_shipping": true });
  }
  return (
    <CModal
      centered
      show={show}
      style={{ minWidth: "625px" }}
      onClose={() => closeModal()}
    >
      <CModalHeader closeButton>Impulsionar publicação</CModalHeader>
      <CModalBody>
        {editingCondition && <PriceToWinTip winnerPrice={winnerPrice} priceToWin={priceToWin} />}
        {editingCondition
          ? (
            <UpdatePublicationCondition
              winnerPrice={winnerPrice}
              priceToWin={priceToWin}
              priceToWinForm={priceToWinForm}
              setPriceToWinForm={setPriceToWinForm}
            />
          ) : <ConditionsTable selfBoosts={selfBoosts} winnerBoosts={winnerBoosts} />
        }
      </CModalBody>
      <CModalFooter>
        <CButton color={editingCondition ? "success" : "primary"} onClick={() => handlePublicationUpdate()}>
          {editingCondition ? "Salvar" : "Editar para ganhar"}
        </CButton>
        <CButton color="secondary" onClick={() => closeModal()}>
          Fechar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

Modal.propTypes = {
  selfBoosts: PropTypes.array.isRequired,
  winnerBoosts: PropTypes.array.isRequired,
  showBoostsModal: PropTypes.bool.isRequired,
  setShowBoostsModal: PropTypes.func.isRequired,
  winnerPrice: PropTypes.number.isRequired,
  currentPrice: PropTypes.number.isRequired,
  priceToWin: PropTypes.number.isRequired,
}

export default Modal;

