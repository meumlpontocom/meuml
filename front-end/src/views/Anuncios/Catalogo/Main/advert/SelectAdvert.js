import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAdvert } from "../../../../../redux/actions/_catalogActions";

export default function SelectAdvert({ id }) {
  const dispatch = useDispatch();
  const {
    advertising,
    allAdvertisingSelected,
    unselectedAdvertsException,
  } = useSelector((state) => state.catalog);

  const select = (checked) => {
    dispatch(selectAdvert({ id, checked }));
  };

  return (
    <td>
      <input
        type="checkbox"
        onChange={({ target: { checked } }) => select(checked)}
        checked={
          advertising[id].selected ||
          (allAdvertisingSelected &&
            !unselectedAdvertsException.find((adId) => adId === id))
        }
        id={`select-advert-${advertising[id]}`}
        name={`select-advert-${advertising[id]}`}
      />
    </td>
  );
}
