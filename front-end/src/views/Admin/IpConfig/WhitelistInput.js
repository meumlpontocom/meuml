import React                                               from "react";
import PropTypes                                           from "prop-types";
import { FaNetworkWired }                                  from "react-icons/fa";
import { CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CLabel } from "@coreui/react";

const WhitelistInput = ({ value, onChange }) => {
  return (
    <>
      <CLabel htmlFor="whitelist-ips">
        Enter the IPs to be whitelisted
      </CLabel>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText><FaNetworkWired /></CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          value={value}
          onChange={onChange}
          type="text"
          id="whitelist-ips"
          placeholder="Ex.: 35.222.146.194/22, 35.222.146.195/22"
          />
      </CInputGroup>
    </>
  );
};

WhitelistInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default WhitelistInput;
