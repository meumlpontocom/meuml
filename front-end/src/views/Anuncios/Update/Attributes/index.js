import React, { useContext } from "react";
import UpdateAdvertContext   from "../UpdateAdvert.Context";
import AttributesForm        from "src/components/AttributesForm";

export default function AdvertAttributes() {
  const { visibleAttributeList } = useContext(UpdateAdvertContext);
  return visibleAttributeList
    ? <AttributesForm context={UpdateAdvertContext} col={{ xs: 12 }} />
    : <></>;
}
