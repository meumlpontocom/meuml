import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PriceCustomInput from "../../AdvertDetails/Price/PriceCustomInput";
import ListingTypeCustomInput from "../../AdvertDetails/ListingType/ListingTypeCustomInput";
import FreeShippingCustomInput from "../../AdvertDetails/FreeShipping/FreeShippingCustomInput";
import ConditionCustomInput from "../../AdvertDetails/Condition/ConditionCustomInput";
import AvailableCustomInput from "../../AdvertDetails/Available/AvailableCustomInput";
import DescriptionCustomInput from "../../AdvertDescription/DescriptionCustomInput";
import Row from "reactstrap/lib/Row";
import TitleCustomInput from "../../AdvertDetails/Title/CustomInput";
import Gtin from "../../AdvertDetails/Gtin";
import ChartSize from "../../AdvertDetails/ChartSize";
import "./style.css";
import Skeleton from "src/components/SkeletonLoading";
import { CCol } from "@coreui/react";

export default function Inputs({ id }) {
  const dispatch = useDispatch();
  const { advertBeingEdited } = useSelector(state => state.advertsReplication);

  const createAdvertEditableCopy = () => {
    dispatch({ type: "REPLICATION_SAVE_ADVERT_BEING_EDITED", payload: id });
  };

  useEffect(() => {
    createAdvertEditableCopy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Row id="scrollable-row">
      <TitleCustomInput />
      <PriceCustomInput />
      <ListingTypeCustomInput />
      <FreeShippingCustomInput />
      <ConditionCustomInput />
      <AvailableCustomInput />
      <DescriptionCustomInput id={id} />
      <Gtin id={id} />
      {!advertBeingEdited ? (
        <CCol>
          <Skeleton.Line height={42} />
        </CCol>
      ) : (
        <ChartSize />
      )}
    </Row>
  );
}
