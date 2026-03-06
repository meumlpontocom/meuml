import React     from "react";
import Modal     from "./Modal";
import PropTypes from "prop-types";

function Boosts(props) {
  const [showBoostsModal, setShowBoostsModal] = React.useState(false);
  return (
    <>
      {props.selfBoosts &&
        <>
          <span
            className="ml-2 pointer"
            onClick={() => setShowBoostsModal(true)}
          >
            <i className="cil cil-bolt mr-1" />
            Boosts
          </span>
          <Modal
            winnerPrice={props.winnerPrice}
            currentPrice={props.currentPrice}
            priceToWin={props.priceToWin}
            show={showBoostsModal}
            advertId={props.advertId}
            selfBoosts={props.selfBoosts}
            winnerBoosts={props.winnerBoosts}
            setShowBoostsModal={setShowBoostsModal}
          />
        </>
      }
    </>
  )
}

Boosts.propTypes = {
  winnerBoosts: PropTypes.array,
  selfBoosts: PropTypes.array,
  advertId: PropTypes.string,
  winnerPrice: PropTypes.number,
  currentPrice: PropTypes.number,
  priceToWin: PropTypes.number,
}

export default Boosts;
