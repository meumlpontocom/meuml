import React          from "react"
import PropTypes      from "prop-types"
import PriceToWinData from "./PriceToWinData"
import formatMoney    from "src/helpers/formatMoney"

function PriceToWinSection(props) {
  const WinnerPrice = () => (
    props.winnerPrice && (
      <PriceToWinData
        icon="dollar"
        label="Preço vencedor"
        value={formatMoney(props.winnerPrice)}
      />
    )
  );

  const CurrentPrice = () => (
    props.currentPrice && (
      <PriceToWinData
        icon="dollar"
        label="Preço vigente"
        value={formatMoney(props.currentPrice)}
      />
    )
  );

  const PriceToWin = () => (
    props.priceToWin && (
      <PriceToWinData
        icon="dollar"
        label="Preço para vencer"
        value={formatMoney(props.priceToWin)}
      />
    )
  );

  return (
    props.catalogListing && (
      <>
        <WinnerPrice />
        <CurrentPrice />
        <PriceToWin />
        <PriceToWinData icon="spreadsheet" label="Razão" value={props.reason} />
        <br />
        <PriceToWinData
          icon="people"
          label="Compartilhando o primeiro lugar"
          value={props.competitorsSharingFirstPlace}
        />
      </>
    )
  )
}

PriceToWinSection.propTypes = {
  competitorsSharingFirstPlace: PropTypes.number,
  winnerPrice: PropTypes.number,
  currentPrice: PropTypes.number,
  priceToWin: PropTypes.number,
}

export default PriceToWinSection;
