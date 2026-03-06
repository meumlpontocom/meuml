import React from "react";
import CustomGroup from "./CustomGroup";
import { useSelector, useDispatch } from "react-redux";

const ConditionInput = () => {
  const dispatch = useDispatch();
  const { condition } = useSelector(
    (state) => state.advertsReplication.bulkEdit
  );
  const setCondition = (value) =>
    dispatch({
      type: "REPLICATION_BULK_UPDATE_DATA",
      payload: { id: "condition", value },
    });

  return (
    <CustomGroup icon="star" label="Condição do produto">
      <select
        className="custom-select"
        name="edit-condition"
        id="edit-condition"
        type="text"
        value={condition}
        onChange={(event) => setCondition(event.target.value)}
      >
        <option value="keep_original">Manter original</option>
        <option value="new">Novo</option>
        <option value="used">Usado</option>
      </select>
    </CustomGroup>
  );
};

export default ConditionInput;
