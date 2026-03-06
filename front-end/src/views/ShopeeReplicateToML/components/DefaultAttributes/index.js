import React, { useContext, useMemo } from "react";
import Form from "./Form";
import BlackCard from "../BlackCard";
import { CCol } from "@coreui/react";
import { FaStickyNote } from "react-icons/fa";
import ShopeeReplicateToMLContext from "../../shopeeReplicateToMLContext";

const DefaultAttributes = () => {
  const {
    selectedCategory,
    form: { required },
  } = useContext(ShopeeReplicateToMLContext);
  const show = useMemo(() => {
    if (selectedCategory.category_id && !selectedCategory.attributes.length) return true;
    if (!selectedCategory.category_id && selectedCategory.id) return true;
    const o = Object.keys(required);
    return !o.length
      ? true
      : o.reduce((allFullfilled, key) => {
          return !required[key] ? false : allFullfilled;
        }, true);
  }, [selectedCategory, required]);
  return !show ? (
    <></>
  ) : (
    <CCol xs={12}>
      <BlackCard
        header={
          <h4>
            <FaStickyNote className="mb-1" />
            &nbsp; Atributos gerais
          </h4>
        }
        body={<Form />}
      />
    </CCol>
  );
};

export default DefaultAttributes;
