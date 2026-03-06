import React, { useCallback } from "react";
import PropTypes              from "prop-types";
import { CButton }            from "@coreui/react";
import { FaSyncAlt }          from "react-icons/fa";
import api, { headers }       from "src/services/api";

const RequestBtn = ({ sent = false, setLoading, setResponse, ipList }) => {

  const postIpFilter = useCallback(async () => {
    setLoading(true);
    const payload = { ip_list: ipList.split(",") }
    const response = await api.post("/ip-filter", payload, headers());
    setResponse(response.data);
    setLoading(false);
  }, [ipList, setLoading, setResponse]);

  return (
    <CButton color="success" onClick={() => postIpFilter()}>
      <FaSyncAlt />
      &nbsp;{sent ? "Reenviar" : "Enviar"}
    </CButton>
  );
};

RequestBtn.propTypes = {
  sent: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
  setResponse: PropTypes.func.isRequired,
  ipList: PropTypes.array.isRequired,
};

export default RequestBtn;
