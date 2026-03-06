import React            from "react";
import PropTypes        from "prop-types"
import { CAlert, CCol } from "@coreui/react";

const PriceToWinTip = ({ winnerPrice, priceToWin }) => {
  return (
    <CCol>
      <CAlert color="info" className="d-flex align-items-center">
        <i className="cil-lightbulb mr-2" />
        <p className="mb-0">
          <em>
            Atualmente o preço vencedor é <strong>R${winnerPrice}</strong>. O preço para ganhar a posição de destaque é <strong>R${priceToWin}</strong>
          </em>
        </p>
      </CAlert>
    </CCol>
  )
}

PriceToWinTip.propTypes = {
  winnerPrice: PropTypes.number.isRequired, 
  priceToWin: PropTypes.number.isRequired
}

export default PriceToWinTip;
