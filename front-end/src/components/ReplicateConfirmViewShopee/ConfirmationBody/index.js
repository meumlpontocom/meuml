import { CCard, CCol, CRow } from "@coreui/react";
import { useSelector } from "react-redux";
import { formatAdvertStatus } from "src/helpers/formatAdvertStatus";
import formatMoney from "src/helpers/formatMoney";
import { getAdvertStatusColor } from "src/helpers/getAdvertStatusClass";
import GenericTable from "../../GenericTable/index";
import Section from "./Section";
import DimensionSection from "./Dimension";
import WeightSection from "./Weight";
import ExpandedRow from "./ExpandedRow";
import { Col } from "reactstrap";
import React, { useMemo } from "react";
import { validateRequiredAttributes } from "../utils/validateShopeeRequiredAttributes";

const ConfirmationBody = React.memo(() => {
  const selectedAdverts = useSelector(state => state.advertsReplication.selectedAdverts);
  const advertsArray = useSelector(state => state.selectedAdverts.advertsArray);
  const isCategoriesLoading = useSelector(state => state.shopee.categoriesTree.isLoading);
  const tableData = useMemo(() => {
    return selectedAdverts.length
      ? selectedAdverts
      : Object.values(advertsArray).filter(item => item.checked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAdverts, advertsArray]);

  const dataTable = useMemo(() => {
    return tableData.map(advert => {
      const advertDimensions = advert?.advertData?.seller_package_dimensions ?? {};
      const advertOriginallyHasAllDimensions =
        Object.values(advertDimensions).filter(value => !!value).length === 4;

      const inputDimensions = advert.dimension
        ? Object.values(advert.dimension).filter(value => !!value).length === 3
        : false;
      const inputWeight = !!advert.weight;
      const advertHasInputDimensions = inputDimensions && inputWeight;

      const requiredAttributesAreFilled = validateRequiredAttributes(advert.shopeeRequiredAttributes ?? []);

      const isComplete =
        advert.categoryId &&
        (advertOriginallyHasAllDimensions || advertHasInputDimensions) &&
        requiredAttributesAreFilled;

      return {
        id: advert.id,
        title: advert.title,
        price: advert.price,
        status: advert.status,
        categoryId: advert.categoryId,
        isValid: isComplete,
        sellerPackageDimension: advertDimensions,
        shopeeRequiredAttributes: advert.shopeeRequiredAttributes || [],
      };
    });
  }, [tableData]);

  const columns = [
    { label: "Código", datakey: "id" },
    { label: "Título", datakey: "title" },
    { label: "Preço", datakey: "price", mask: formatMoney },
    { label: "Status", datakey: "status", mask: formatAdvertStatus, textColor: getAdvertStatusColor },
  ];

  return (
    <>
      <CRow>
        <CCol xs={12} sm={12} md={12} lg={12}>
          <CRow>
            <CCol xs="12" md="6">
              <DimensionSection />
            </CCol>
            <CCol xs="12" md="6">
              <WeightSection />
            </CCol>
          </CRow>
          <CCard>
            <Section>
              Produtos
              <br />
              <span style={{ fontSize: "16px", color: "#888" }}>
                Clique na linha do item para expandir e informar os atributos específicos.
              </span>
            </Section>

            <Col className="mt-3">
              <GenericTable
                columns={columns}
                data={dataTable}
                renderExpandedRow={item => <ExpandedRow item={item} />}
                isLoading={isCategoriesLoading}
              />
            </Col>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
});

export default ConfirmationBody;
