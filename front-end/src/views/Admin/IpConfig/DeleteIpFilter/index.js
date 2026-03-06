import React, { useCallback, useState } from "react";
import Request                          from "../Request";
import RequestBtn                       from "./RequestBtn";
import { CCol, CRow }                   from "@coreui/react";
import WhitelistInput                   from "../WhitelistInput";
import LoadingContainer                 from "../LoadingContainer";
import PrettyRenderJSON                 from "../PrettyRenderJSON";

const DeleteIpFilter = () => {
  const [DELETE, setDELETE] = useState(null);
  const [isLoadingDELETE, setIsLoadingDELETE] = useState(false);
  const [whitelistInputValue, setWhitelistInputValue] = useState("");

  const handleWhitelistInputChange = useCallback(({ target: { value } }) => {
    setWhitelistInputValue(value.replace(" ", ""));
  }, []);

  return (
    <Request
      type="DELETE"
      path="/ip-filter"
      description="Whitelist IPs"
      sendBtn={
        <RequestBtn
          sent={DELETE !== null}
          setLoading={setIsLoadingDELETE}
          setResponse={setDELETE}
          ipList={whitelistInputValue}
        />
      }
    >
      <LoadingContainer isLoading={isLoadingDELETE}>
        <CRow>
          <CCol xs="12" md="6" className="mb-3">
            <WhitelistInput value={whitelistInputValue} onChange={handleWhitelistInputChange} />
          </CCol>
          <CCol xs="12">
            {DELETE !== null && (
              <PrettyRenderJSON
                json={{ data: DELETE.data, status: DELETE.status, statusCode: DELETE.statusCode }}
              />
            )}
          </CCol>
        </CRow>
      </LoadingContainer>
    </Request>
  );
};

export default DeleteIpFilter;
