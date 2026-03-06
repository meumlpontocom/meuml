import React from "react";
import PropTypes from "prop-types";
import Thumbnail from "./Thumbnail";
import Data from "./Data";
import OptionsBtn from "./OptionsBtn";
import { CCol } from "@coreui/react";
import { useSelector } from "react-redux";
import formatMoney from "src/helpers/formatMoney";
import SelectAdvertising from "./SelectAdvertising";

function Advertising({ advertId, advertImage, accountId }) {
  const { price, original_price, sales } = useSelector(
    ({ shopee }) =>
      shopee.advertising.list.filter((advert) => advert.id === advertId)[0]
  );
  return (
    <tr>
      <SelectAdvertising accountId={accountId} advertId={advertId} />
      <Thumbnail secure_thumbnail={advertImage} />
      <Data id={advertId} />
      <td className="text-center">
        <OptionsBtn id={advertId} />
        <CCol xs="12" className="text-right">
          <p style={{ paddingBottom: "1px", marginBottom: "0px" }}>
            <i className="cui cui-cash mr-1" />
            {original_price !== price ? (
              <strike>{formatMoney(original_price)}</strike>
            ) : (
                <b>{formatMoney(original_price)}</b>
              )}
          </p>
          {original_price !== price ? (
            <small className="text-primary">{formatMoney(price)}</small>
          ) : (
              <></>
            )}
          <p>
            <i className="cui cui-fax mr-1" />
            Vendas: { sales === 0 ? 'N/A' : sales }
          </p>
        </CCol>
      </td>
    </tr>
  );
}

Advertising.propTypes = {
  advertId: PropTypes.number.isRequired,
  advertImage: PropTypes.string,
  accountId: PropTypes.number.isRequired
};

export default Advertising;
