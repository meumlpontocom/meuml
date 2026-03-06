import React     from "react";
import PropTypes from "prop-types";

function StockConditions({ min ,max }) {
  const Min = () => (
    min 
      ? <p>Estoque mínimo&nbsp;{min}</p>
      : <></>
  );
  const Max = () => (
    max 
      ? <p>Estoque mínimo&nbsp;{max}</p>
      : <></>
  );
  return (
    <>
     <Min /> 
     <Max /> 
    </>
  )
}

StockConditions.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number
}

export default StockConditions;
