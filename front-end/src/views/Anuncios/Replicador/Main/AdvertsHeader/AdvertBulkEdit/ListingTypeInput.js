import React from "react";
import CustomGroup from "./CustomGroup";
import { useSelector, useDispatch } from "react-redux";

const ListingTypeInput = () => {
  const dispatch = useDispatch();
  const { listing_type_id } = useSelector(
    (state) => state.advertsReplication.bulkEdit
  );
  const setListingType = (value) =>
    dispatch({
      type: "REPLICATION_BULK_UPDATE_DATA",
      payload: { id: "listing_type_id", value },
    });

  return (
    <CustomGroup icon="audio-description" label="Tipo do anúncio">
      <select
        className="custom-select"
        name="edit-listing-type"
        id="edit-listing-type"
        type="text"
        value={listing_type_id}
        onChange={(event) => setListingType(event.target.value)}
      >
        <option value="keep_original">Manter original</option>
        <option value="gold_pro">Premium</option>
        <option value="gold_special">Clássico</option>
      </select>
    </CustomGroup>
  );
};

export default ListingTypeInput;
