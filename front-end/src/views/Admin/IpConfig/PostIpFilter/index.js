import React, { useCallback, useState } from "react";
import Request                          from "../Request";
import RequestBtn                       from "./RequestBtn";
import { CCol, CRow }                   from "@coreui/react";
import WhitelistInput                   from "../WhitelistInput";
import LoadingContainer                 from "../LoadingContainer";
import PrettyRenderJSON                 from "../PrettyRenderJSON";

const PostIpFilter = () => {
  const [POST, setPOST] = useState(null);
  const [isLoadingPOST, setIsLoadingPOST] = useState(false);
  const [whitelistInputValue, setWhitelistInputValue] = useState("");

  const handleWhitelistInputChange = useCallback(({ target: { value } }) => {
    setWhitelistInputValue(value.replace(" ", ""));
  }, []);

  return (
    <Request
      type="POST"
      path="/ip-filter"
      description="Whitelist IPs"
      sendBtn={
        <RequestBtn
          sent={POST !== null}
          setLoading={setIsLoadingPOST}
          setResponse={setPOST}
          ipList={whitelistInputValue}
        />
      }
    >
      <LoadingContainer isLoading={isLoadingPOST}>
        <CRow>
          <CCol xs="12" md="6" className="mb-3">
            <WhitelistInput value={whitelistInputValue} onChange={handleWhitelistInputChange} />
          </CCol>
          <CCol xs="12">
            {POST !== null && (
              <PrettyRenderJSON
                json={{ data: POST.data, status: POST.status, statusCode: POST.statusCode }}
              />
            )}
          </CCol>
        </CRow>
      </LoadingContainer>
    </Request>
  );
};

export default PostIpFilter;
