import React                    from "react";
import { useSelector }          from "react-redux";
import styled                   from "styled-components";
import { Link }                 from "react-router-dom";
import Loading                  from "react-loading";
import { CCol, CRow }           from "@coreui/react";

import { DropDown }             from "src/components/buttons/ButtonGroup.js";
import  ProductUpdateShipping   from "../../atoms/ProductUpdateShipping/index.js";

const DropDownMenuStyles = styled.div`
  .dropdown-menu {
    min-width: fit-content;
  }
`;

export default function ProductOptions({ advertId, ad, history }) {

  const { loadingShipping } = useSelector((state) => state.mshops);

  return (
    <DropDownMenuStyles>
      {loadingShipping ? (
        <CRow style={{ justifyContent: "center"}}>
          <CCol
              sm={{ size: "auto" }}
              md={{ size: "auto" }}
              lg={{ size: "auto" }}
              xs={{ size: "auto" }}
          >
            <Loading
                type="spinningBubbles"
                color="#054785"
                height={30}
                width={30}
            />
          </CCol>
        </CRow>
      ) : (
        <DropDown
          direction="left"
          caret={true}
          color="primary"
          title={
            <span>
              <i className="cil-cog mr-1 mt-1" />
              Opções
            </span>
          }
          className="options-button"
        >
          <Link
            className="dropdown-item"
            to={{
              pathname: `/anuncios/editar/${advertId}`,
              state: { accountId: ad.account_id, advertId },
            }}
          >
            Editar
          </Link>
          <ProductUpdateShipping product={ad} history={history}/>
        </DropDown>
      )}
    </DropDownMenuStyles>
  );
}
