import React, { useContext }      from "react";
import { CCard, CCardBody }       from "@coreui/react";
import CardHeader                 from "../atoms/CardHeader";
import AdvertLink                 from "../atoms/AdvertLink";
import { catalogChartsContext }   from "../catalogChartsContext";
import SearchCategoryBtn          from "../atoms/SearchCategoryBtn";
import SearchCategoryInput        from "../atoms/SearchCategoryInput";
import { CardFooterBtnContainer } from "../atoms/CardFooterBtnContainer";

export default function SearchCategory() {
  const { selectedAccount } = useContext(catalogChartsContext);
  return selectedAccount.length ? (
    <CCard>
      <CardHeader 
        text={
          <>
            Pesquisar categorias
            <AdvertLink />
          </>
        }
      />
      <CCardBody>
        <SearchCategoryInput />
      </CCardBody>
      <CardFooterBtnContainer>
        <SearchCategoryBtn />
      </CardFooterBtnContainer>
    </CCard>
  ) : <></>;
}
