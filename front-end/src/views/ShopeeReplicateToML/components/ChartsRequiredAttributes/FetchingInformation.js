import React           from "react";
import BlackCard       from "../BlackCard";
import CardHeader      from "./CardHeader";
import { CCol }        from "@coreui/react";
import LoadingCardData from "../../../../components/LoadingCardData";

const FetchingInformation = () => {
  return (
    <CCol xs={12}>
      <BlackCard
        header={<CardHeader />}
        body={
          <CCol className="text-center">
            <h4>Checando obrigatoriedades da categoria Mercado Livre.</h4>
            <LoadingCardData />
          </CCol>
        }
      />
    </CCol>
  );
};

export default FetchingInformation;
