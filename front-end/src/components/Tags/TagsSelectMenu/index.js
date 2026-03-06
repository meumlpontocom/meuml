/* eslint-disable react-hooks/exhaustive-deps */
import { CCol } from "@coreui/react";
import React from "react";
import { Picky } from "react-picky";
import { useDispatch, useSelector } from "react-redux";
import { resetState, saveSelectedTags } from "../../../redux/actions/_tagsActions";
import requests from "../requests";

export default function TagsSelectMenu({ xs, sm, md, lg }) {
  const dispatch = useDispatch();
  const { tags, selectedTags, isLoading } = useSelector(({ tags }) => tags);

  const onSelect = selected => dispatch(saveSelectedTags(selected));

  React.useEffect(() => {
    requests.getTags({ dispatch, page: 1 });
  }, []);

  React.useEffect(() => {
    onSelect([]);
    dispatch(resetState());
  }, []);

  return (
    <CCol xs={xs} sm={sm} md={md} lg={lg}>
      <Picky
        onChange={selected => onSelect(selected)}
        includeSelectAll={true}
        includeFilter={true}
        dropdownHeight={600}
        multiple={true}
        options={tags}
        value={selectedTags}
        open={false}
        valueKey="id"
        labelKey="name"
        id="tags-select-menu"
        name="tags-select-menu"
        className="input-group d-inline"
        selectAllText="Selecionar Todos"
        filterPlaceholder="Filtrar por..."
        allSelectedPlaceholder="%s Selecionados"
        manySelectedPlaceholder="%s Selecionados"
        placeholder="Selecionar tags . . ."
        disabled={isLoading}
      />
    </CCol>
  );
}
