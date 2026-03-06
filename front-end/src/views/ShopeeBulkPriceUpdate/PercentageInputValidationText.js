import React from 'react'

const PercentageInputValidationText = ({ className }) => {
  return className === "is-invalid"
    ? (
      <small className="text-danger">
        Mínimo de 1% e máximo de 80%
      </small>
    )
    : (<></>)
}

export default PercentageInputValidationText;