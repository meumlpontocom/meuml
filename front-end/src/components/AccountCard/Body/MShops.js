import React, { useMemo } from "react";
import { CRow } 	        from "@coreui/react";
import { useSelector }    from "react-redux";

function MShops({ id }) {
  const { accounts } = useSelector(state => state.accounts);
  const mshopsLogo = "https://http2.mlstatic.com/frontend-assets/mshops-web-landing/30e34bac1234af415c55.svg";
  const shouldRenderMShopsBadge = useMemo(() =>
    !!accounts[id]?.tags?.filter(tag => tag === "mshops")?.length || false,
    [accounts, id]
  );
  return shouldRenderMShopsBadge ? (
    <CRow className="d-flex align-items-center justify-content-center">
	<img
	  width="90"
	  src={mshopsLogo}
	  alt="ícone de mercado shops"
	  className="img-responsive mb-3 mt-3"
	/>
    </CRow>
  ) : <></>;
}

export default MShops;
