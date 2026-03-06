import React                                                                               from "react"
import PropTypes                                                                           from "prop-types"
import { CCol, CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CLabel, CSwitch } from "@coreui/react"
import NumberFormat                                                                        from "react-number-format";

function UpdatePublicationCondition({ priceToWinForm, setPriceToWinForm }) {
  const onChange = ({ id, value }) => {
    setPriceToWinForm(currentState => ({ ...currentState, [id]: value }));
  }
  return (
    <>
      <CCol className="d-flex align-items-center">
        <CSwitch
          labelOn="Sim"
          labelOff="Não"
          color="primary"
          variant="outline"
          checked={priceToWinForm["free_shipping"]}
          onChange={({ target }) => onChange({ id: "free_shipping", value: target.value })}
        />
        <CLabel htmlFor="boost-config" className="ml-2">Frete Grátis</CLabel>
      </CCol>
      <CCol className="d-flex align-items-center mt-2">
        <CSwitch
          labelOn="Sim"
          labelOff="Não"
          color="primary"
          variant="outline"
          checked={priceToWinForm["no_interest"]}
          onChange={({ target }) => onChange({ id: "no_interest", value: target.value })}
        />
        <CLabel htmlFor="boost-config" className="ml-2">Parcelamento sem juros</CLabel>
      </CCol>
      <CCol className="mt-2" xs={12} md={6}>
        <CInputGroup>
          <CInputGroupPrepend>
            <CInputGroupText>Novo preço</CInputGroupText>
          </CInputGroupPrepend>
          <NumberFormat
            onValueChange={values => onChange({ id: "price", value: values.floatValue })}
            customInput={CInput}
            decimalSeparator=","
            thousandSeparator="."
            fixedDecimalScale
            displayType="input"
            prefix="R$"
            decimalScale={2}
            renderText={value => <>{value}</>}
          />
        </CInputGroup>
      </CCol>
    </>
  )
}

UpdatePublicationCondition.propTypes = {
  boostLabel: PropTypes.string.isRequired,
  currentPrice: PropTypes.number.isRequired,
}

export default UpdatePublicationCondition;
