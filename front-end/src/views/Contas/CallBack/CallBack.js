import React                from "react";
import ReactLoading         from "react-loading";
import { CRow }             from "@coreui/react";
import Redirection          from "./Redirection";
import useMLAccountCallback from "./useMLAccountCallback";

// ML's CallBack URL example:
// www.domain.com/#/callback?code=TG-5f7f665d074b960006d4b059-250102780&state=qQLKqGp5hRvTh5FgOpw8FJ5adOKYg6

export default function CallBack() {
  const [redirect] = useMLAccountCallback();
  return (
    <CRow className="d-flex justify-content-center align-items-center">
      <Redirection redirect={redirect} />
      <ReactLoading
        type={"spinningBubbles"}
        color={"#054785"}
        height={100}
        width={100}
        className="spinnerStyle"
      />
    </CRow>
  );
}
