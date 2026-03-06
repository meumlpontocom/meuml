import { CCard, CCardBody, CCardHeader, CCardTitle, CRow } from "@coreui/react";
import { useContext } from "react";
import SearchPublicInfoContext from "../SearchPublicInfo.context";
import Address from "./Address";
import Id from "./Id";
import Nickname from "./Nickname";
import VisitBtn from "./VisitBtn";

const SellerCard = () => {
  const { searchResult } = useContext(SearchPublicInfoContext);

  return !Object.keys(searchResult).length ? (
    <></>
  ) : (
    <CCard>
      <CCardHeader className="bg-gradient-secondary">
        <CCardTitle className="text-success">{searchResult.nickname}</CCardTitle>
      </CCardHeader>
      <CCardBody>
        <Id />
        <Nickname />
        <Address />
        <CRow className="d-flex justify-content-end" style={{ paddingRight: "16px" }}>
          <VisitBtn />
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default SellerCard;
