import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAdvert } from "../../../../../redux/actions";
import { useState } from "react";

export default function SelectAdsRow({ adID, adIndex, status, title, price, advertData }) {
  const dispatch = useDispatch();

  const advertsArray = useSelector(state => state.selectedAdverts.advertsArray);
  const selectedAdverts = useSelector(state => state.selectedAdverts);

  const [checked, setChecked] = useState(false);
  const allChecked = useMemo(() => selectedAdverts.allChecked, [selectedAdverts]);

  useEffect(() => {
    if (advertsArray[adID]) {
      setChecked(advertsArray[adID].checked);
    } else if (allChecked) setChecked(true);
    else setChecked(false);
  }, [advertsArray, adID, allChecked]);

  return (
    <td
      id="checkboxTableTd"
      name="checkboxTableTd"
      style={{ verticalAlign: "middle" }}
      className="select-ad-row"
    >
      <input
        id="checkbox"
        name="checkbox"
        type="checkbox"
        checked={checked}
        onChange={event => {
          dispatch(
            checkAdvert({
              id: adID,
              checked: event.target.checked,
              status,
              title,
              price,
              advertData: event.target.checked ? advertData : null,
              shopeeRequiredAttributes: [],
            }),
          );
        }}
      />
    </td>
  );
}
