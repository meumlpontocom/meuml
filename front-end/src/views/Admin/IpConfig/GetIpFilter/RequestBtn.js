import React, { useCallback, useEffect } from "react";
import PropTypes                         from "prop-types";
import { CButton }                       from "@coreui/react";
import { FaSyncAlt }                     from "react-icons/fa";
import api, { headers }                  from "src/services/api";

const RequestBtn = ({ sent = false, setLoading, setResponse }) => {
  const getIpFilter = useCallback(async () => {
    setLoading(true);
    const response = await api.get("/ip-filter", headers());
    setResponse(response.data);
    setLoading(false);
  }, [setLoading, setResponse]);

  useEffect(() => {
    getIpFilter();
  }, [getIpFilter]);

  return (
    <CButton color="success" onClick={() => getIpFilter()}>
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
