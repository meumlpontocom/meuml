import React, { useContext }      from "react";
import BlackCard                  from "../BlackCard";
import { CRow, CCol }             from "@coreui/react";
import { FaReply }                from "react-icons/fa";
import SelectedCategoryName       from "./SelectedCategoryName";
import SelectedCategoryPath       from "./SelectedCategoryPath";
import shopeeReplicateToMLContext from "../../shopeeReplicateToMLContext";
import Button                     from "../../../../components/buttons/Button";

const SelectedCategory = () => {
  const { resetStates, categoryAttributes } = useContext(shopeeReplicateToMLContext);
  return categoryAttributes.id ? (
    <CCol xs={12} md={6}>
      <BlackCard
        header={<SelectedCategoryName name={categoryAttributes?.name} />}
        body={<SelectedCategoryPath path={categoryAttributes?.path} />}
        footer={
          <CRow className="d-flex justify-content-center">
            <CCol xs={12} md={6}>
              <Button
                color="outline-secondary"
                size="lg"
                block
                onClick={resetStates}
              >
                <FaReply className="mb-2" />&nbsp;
                Escolher novamente
              </Button>
            </CCol>
          </CRow>
        }
      />
    </CCol>
  ) : <></>;
};

export default SelectedCategory;
