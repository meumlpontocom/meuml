import React                                                from "react";
import Label                                                from "./Label";
import PropTypes                                            from "prop-types";
import classNames                                           from "classnames";
import CustomInput                                          from "../CustomInput";
import { FaPercentage }                                     from "react-icons/fa";
import NumberFormat                                         from "react-number-format";
import { CInputGroup, CInputGroupPrepend, CInputGroupText } from "@coreui/react";

const PercentageInput = ({ percentage, setPercentage }) => {
  const percentageInputClassName = classNames(percentage >= 1 ? "is-valid" : "is-invalid");
  return (
    <>
      <Label htmlFor="percentage-input" />
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            &nbsp;<FaPercentage />&nbsp;
          </CInputGroupText>
        </CInputGroupPrepend>
        <NumberFormat
          suffix="%"
          max={80.0}
          min={0.10}
          decimalScale={2}
          fixedDecimalScale
          value={percentage}
          displayType="input"
          decimalSeparator="."
          id="percentage-input"
          name="percentage-input"
          customInput={CustomInput}
          placeholder="Digite apenas números"
          className={percentageInputClassName}
          renderText={(value)             => <div>{value}</div>}
          onValueChange={({ floatValue }) => setPercentage(floatValue)}
        />
      </CInputGroup>
    </>
  )
}

PercentageInput.propTypes = {
  percentage: PropTypes.number.isRequired,
  setPercentage: PropTypes.func.isRequired
}

export default PercentageInput;
