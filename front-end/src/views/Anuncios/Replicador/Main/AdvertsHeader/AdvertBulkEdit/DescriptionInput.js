import React from "react";
import CustomGroup from "./CustomGroup";
import Input from "reactstrap/lib/Input";
import { useSelector, useDispatch } from "react-redux";

const DescriptionInput = () => {
  const dispatch = useDispatch();
  const { description: {plain_text} } = useSelector(
    (state) => state.advertsReplication.bulkEdit
  );
  const setDescription = (value) =>
    dispatch({
      type: "REPLICATION_BULK_UPDATE_DATA",
      payload: { id: "description", value: { plain_text: value } },
    });

  return (
    <CustomGroup icon="short-text" label="Descrição">
      <Input
        name="edit-description"
        id="edit-description"
        type="textarea"
        min={1}
        value={plain_text}
        placeholder="Manter original"
        onChange={(event) => setDescription(event.target.value)}
      />
    </CustomGroup>
  );
};

export default DescriptionInput;
