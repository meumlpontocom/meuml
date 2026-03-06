import React, { useContext }      from "react";
import Form                       from "./Form";
import CardTitle                  from "./CardTitle";
import BlackCard                  from "../BlackCard";
import { CCol }                   from "@coreui/react";
import shopeeReplicateToMLContext from "../../shopeeReplicateToMLContext";
import LoadingCardData            from "../../../../components/LoadingCardData";

const Loading = () =>
  <CCol>
    <LoadingCardData />
  </CCol>;

const Main = () => {
  const { isLoadingCategoryAttributes } = useContext(shopeeReplicateToMLContext);
  return (
    <CCol xs={12}>
      <BlackCard
        header={<CardTitle />}
        body={isLoadingCategoryAttributes ? <Loading /> : <Form />}
      />
    </CCol>
  );
};

export default Main;
