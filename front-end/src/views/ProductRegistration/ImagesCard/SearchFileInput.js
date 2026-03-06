import React, { useCallback }                                               from "react";
import { useDispatch, useSelector }                                         from "react-redux";
import { listFilesWithFilterString }                                        from "../../ImagesStore/requests";
import { CLabel, CInput, CInputGroup, CInputGroupPrepend, CInputGroupText } from "@coreui/react";
import {
  setCurrentDirectoryImages,
  setSearch,
  setSelectedDirectoryId
}                                                                           from "../../../redux/actions/_newProductActions";

function SearchFileInput() {
  const dispatch = useDispatch();
  const filterString = useSelector(state => state.newProduct.images.search);
  const currentDirectoryID = useSelector(state => state.newProduct.images.currentDirectoryID);
  const currentDirectoryName = useSelector(state => state.newProduct.images.directories
    .filter(dir => dir.id === currentDirectoryID)[0]?.name ?? "todas as pastas");
  const handleInputValueChange = useCallback(event => dispatch(setSearch(event.target.value)), [dispatch]);

  const onSubmit = useCallback(function (event) {
    if (event.key === "Enter") {
      listFilesWithFilterString({ filterString, page: 1 })
        .then(response => {
          if (response) {
            dispatch(setSelectedDirectoryId("searchFiles"));
            dispatch(setCurrentDirectoryImages(response.data.data));
          }
        });
    }
  }, [dispatch, filterString]);

  return (
    <>
      <CLabel htmlFor="search-images-input">
        Procurar dentro de <strong className="text-warning">{currentDirectoryName}</strong>:
      </CLabel>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <i className="cil-search"/>
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          onKeyPress={onSubmit}
          onChange={handleInputValueChange}
          value={filterString}
          type="text"
          name="search-images"
          id="search-images-input"
          placeholder="Pesquisar imagens"
        />
      </CInputGroup>
    </>
  );
}

export default SearchFileInput;
