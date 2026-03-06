import { CCol, CRow, CSpinner } from "@coreui/react";
import { useContext } from "react";
import SearchPublicInfoContext from "../SearchPublicInfo.context";
import SearchCard from "./SearchCard";
import SellerCard from "./SellerCard";

const Search = () => {
  const { isLoading } = useContext(SearchPublicInfoContext);
  return (
    <CRow>
      <CCol xs="12" md="6">
        <SearchCard />
      </CCol>
      <CCol xs="12" style={{ padding: 0 }} className={isLoading ? "d-flex justify-content-center" : ""}>
        {!isLoading && (
          <CCol xs="12" md="8">
            <SellerCard />
          </CCol>
        )}
        {isLoading && <CSpinner color="primary" className="mt-5" />}
      </CCol>
    </CRow>
  );
};

export default Search;
