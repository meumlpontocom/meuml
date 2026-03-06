import React, { useEffect, useMemo, useState }                                 from "react";
import ImageCard
                                                                               from "../../components/ImagesStore/ImageCard";
import Pagination                                                              from "react-js-pagination";
import LoadingCardData                                                         from "../../components/LoadingCardData";
import refreshImageList                                                        from "./refreshImageList";
import { useDispatch, useSelector }                                            from "react-redux";
import {
  CButtonGroup,
  CButton,
  CDropdownItem,
  CCard,
  CCardBody,
  CCardHeader,
  CCardFooter,
  CCol,
  CRow,
}                                                                              from "@coreui/react";
import { DropDown }                                                            from "src/components/buttons/ButtonGroup";
import { createFilesTags, deleteFilesTags, deleteMultipleFiles, fetchAllTags } from "src/views/ImagesStore/requests";
import Swal                                                                    from "sweetalert2";
import { setImageStorageClearImageSelection, setImageStorageSelectAllImages }  from "src/redux/actions";

const ImagesStoreImagesDisplay = () => {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(() => false);
  const { search, searchResult, currentFolderPagination } = useSelector(({ imageStorage }) => imageStorage);
  const { images, selectedPictures, selectAllPictures } = useSelector(({ imageStorage }) => imageStorage.files);
  const selectedFolder = useSelector(({ imageStorage: { files: { folders } } }) => folders
    .filter(folder => folder.isSelected)[0]);

  useEffect(() => {
    if (selectedFolder) {
      refreshImageList(dispatch, setLoading, 1, selectedFolder.id);
    }
  }, [selectedFolder, dispatch]);

  function handleClickSelectAllPictures() {
    dispatch(setImageStorageSelectAllImages());
  }

  function handleClickClearPicturesSelection() {
    dispatch(setImageStorageClearImageSelection());
  }

  function fetchDataWithPagination(page) {
    refreshImageList(dispatch, setLoading, page);
  }

  const imageList = useMemo(() => {
    if (search) return searchResult;
    else if (images?.length && selectedFolder?.id) return images.filter(img => img.parent_id === selectedFolder?.id);
    else return [];
  }, [images, searchResult, search, selectedFolder]);

  const PaginationInfo = ({ float }) => (
    currentFolderPagination.total
    ? (
      <CCol>
        <h6 className={` text-info text-${float}`}>Exibindo {imageList.length} de {currentFolderPagination.total}</h6>
      </CCol>
    )
    : <></>
  );

  async function handleClickBulkDeletePictures(confirmed) {
    if (selectedPictures.length || selectAllPictures) {
      const response = await deleteMultipleFiles({
        confirmed,
        setLoading,
        filterString: search,
        selectAll: selectAllPictures,
        filesIds: selectedPictures.join(", "),
      });
      if (response) {
        const userResponse = await Swal.fire({
          title: "Atenção",
          text: response.data.message,
          type: response.data.status,
          showCloseButton: true,
          showConfirmButton: true,
          showCancelButton: !!!confirmed,
          confirmButtonText: !confirmed ? "Confirmar" : "Ok",
          cancelButtonText: "Cancelar",
        });
        if (userResponse.value && !confirmed) await handleClickBulkDeletePictures(1);
        else if (confirmed) await refreshImageList(dispatch, setLoading, 1);
      }
    } else {
      await Swal.fire({
        title: "Atenção!",
        text: "Selecione ao menos uma imagem!",
        type: "error",
        showCloseButton: true,
      });
    }
  }

  async function handleClickBulkDeleteTags() {
    let inputOptions = {};
    await fetchAllTags().then(r => r.data.data.forEach(t => inputOptions[t.id] = t.name));
    const user = await Swal.fire({
      title: "Remover tags",
      input: "select",
      type: "question",
      text: "Escolha a tag para remover das imagens selecionadas",
      inputOptions,
      inputPlaceholder: "Selecione uma tag MeuML",
      showCancelButton: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value) resolve();
          else resolve("Você deve selecionar ao menos uma tag.");
        });
      },
    });
    if (user.value) {
      const tagDeleteResponse = await deleteFilesTags({
        setLoading,
        selectAll: selectAllPictures,
        payload: {
          data: {
            type: "untag_files",
            attributes: {
              tags: [Number(user.value)],
              files_id: selectedPictures,
            },
          },
        },
      });
      if (tagDeleteResponse) {
        await refreshImageList(dispatch, setLoading, 1);
        await Swal.fire({
          title: "Atenção",
          text: tagDeleteResponse.data.message,
          type: tagDeleteResponse.data.status,
        });
      }
    }
  }

  async function handleClickBulkAddTags() {
    let inputOptions = {};
    await fetchAllTags().then(r => r.data.data.forEach(t => inputOptions[t.name] = t.name));
    const user = await Swal.fire({
      title: "Adicionar tag",
      input: "select",
      type: "question",
      text: "Escolha a tag para adicionar nas imagens selecionadas",
      inputOptions,
      inputPlaceholder: "Selecione uma tag MeuML",
      showCancelButton: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value) resolve();
          else resolve("Você deve selecionar ao menos uma tag.");
        });
      },
    });
    if (user.value) {
      const createFileTagResponse = await createFilesTags({
        setLoading,
        parentId: selectedFolder.id,
        selectAll: selectAllPictures,
        payload: {
          data: {
            type: "tag_files",
            attributes: {
              tags: [user.value],
              files_id: selectedPictures,
            },
          },
        },
      });
      if (createFileTagResponse) {
        await refreshImageList(dispatch, setLoading, 1);
        await Swal.fire({
          title: "Atenção",
          text: createFileTagResponse.data.message,
          type: createFileTagResponse.data.status,
        });
      }
    }
  }

  return (
    <CCard className="flex-grow-1">
      <CCardHeader>
        <CRow>
          <CCol xs={6}>
            <h4 className="text-info">
              <i className="cil cil-image icon-fix mr-1"/>
              Imagens
            </h4>
          </CCol>
          <PaginationInfo float="right"/>
        </CRow>
      </CCardHeader>
      <CCardBody style={{ overflowX: "hidden" }}>
        {isLoading
         ? (
           <div style={{ marginTop: "5em" }}>
             <LoadingCardData/>
           </div>
         )
         : (
           <>
             {imageList.length
              ? (
                <CRow className="d-flex justify-content-center justify-content-around">
                  <CCol xs={12} className="mb-3">
                    <CRow>
                      <CButtonGroup className="mr-2">
                        <CButton color="primary" onClick={handleClickSelectAllPictures}>Selecionar todas</CButton>
                        <CButton color="secondary" onClick={handleClickClearPicturesSelection}>Limpar seleção</CButton>
                      </CButtonGroup>
                      <CButton color="danger" className="mr-2" onClick={() => handleClickBulkDeletePictures(0)}>
                        <i className="cil cil-trash icon-fix"/>&nbsp;Apagar
                      </CButton>
                      <DropDown
                        title={
                          <span>
                          <i className="cil cil-tag icon-fix mr-1"/>
                          Configurar tags
                        </span>
                        }
                        caret
                        color="dark"
                        direction="right"
                      >
                        <CDropdownItem onClick={handleClickBulkDeleteTags}>Remover dos selecionados</CDropdownItem>
                        <CDropdownItem onClick={handleClickBulkAddTags}>Adicionar aos selecionados</CDropdownItem>
                      </DropDown>
                    </CRow>
                  </CCol>
                  {imageList.map(({ id }) => <ImageCard key={id} id={id} setLoading={setLoading}/>)}
                </CRow>
              )
              : (
                <CCol className="text-muted text-center">
                  <h5 style={{ marginTop: "5em" }}>
                    {selectedFolder?.id
                     ? <p>Nenhuma imagem na pasta atual.</p>
                     : <p>Selecione uma pasta ao lado para ver o conteúdo ou pesquise no campo acima.</p>
                    }
                  </h5>
                </CCol>
              )}
           </>
         )}
      </CCardBody>
      <CCardFooter className="d-flex justify-content-start justify-content-md-end align-items-center">
        <PaginationInfo float="left"/>
        <Pagination
          onChange={(page) => fetchDataWithPagination(page)}
          itemsCountPerPage={currentFolderPagination.limit}
          totalItemsCount={currentFolderPagination.total}
          activePage={currentFolderPagination.page}
          pageRangeDisplayed={5}
          innerClass="btn-group"
          activeLinkClass="text-white"
          activeClass="btn btn-md btn-info"
          itemClass="btn btn-md btn-outline-info"
        />
      </CCardFooter>
    </CCard>
  );
};

export default ImagesStoreImagesDisplay;
