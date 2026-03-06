import React, { useState } from "react";
import Request             from "../Request";
import RequestBtn          from "./RequestBtn";
import LoadingContainer    from "../LoadingContainer";
import PrettyRenderJSON    from "../PrettyRenderJSON";

const GetIpFilter = () => {
  const [GET, setGET] = useState(null);
  const [isLoadingGET, setIsLoadingGET] = useState(true);
  return (
    <Request
      type="GET"
      path="/ip-filter"
      description="Show whitelisted IPs"
      sendBtn={<RequestBtn sent={GET !== null} setLoading={setIsLoadingGET} setResponse={setGET} />}
    >
      <LoadingContainer isLoading={isLoadingGET}>
        {GET !== null && (
          <PrettyRenderJSON
            json={{ data: GET.data, message: GET.message, status: GET.status, statusCode: GET.statusCode }}
          />
        )}
      </LoadingContainer>
    </Request>
  );
};

export default GetIpFilter;
