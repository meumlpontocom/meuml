import React, { useState }                       from "react";
import Swal                                      from "sweetalert2";
import { toast }                                 from "react-toastify";
import ImageUploader                             from "react-images-upload";
import withReactContent                          from "sweetalert2-react-content";
import refreshImageList                          from "./refreshImageList";
import { useDispatch, useSelector }              from "react-redux";
import { createFile, listFilesWithFilterString } from "./requests";
import {
  setFolderPagination,
  setIsImageStorageLoading,
  setSearchFileResult,
  setSearchString,
  setUploadFiles
}                                                from "../../redux/actions";
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CCardFooter,
  CInput,
  CInputGroup,
  CInputGroupAppend,
  CButton,
  CCollapse,
  CLabel
}                                                from "@coreui/react";

const ImagesStoreHeader = () => {
  const dispatch = useDispatch();
  const toggle = () => setCollapse(!collapse);
  const [collapse, setCollapse] = useState(false);
  const setSearchInput = string => dispatch(setSearchString(string));
  const searchInput = useSelector(state => state.imageStorage.search);
  const files = useSelector(state => state.imageStorage.files.uploadList);
  const setUploadFile = fileArray => dispatch(setUploadFiles(fileArray));
  const setLoading = boolean => dispatch(setIsImageStorageLoading(boolean));
  const parentId = useSelector(state => state.imageStorage.files.folders
    .filter(folder => folder.isSelected)[0]?.id ?? false
  );
  const ReactSwal = withReactContent(Swal);

  function onDrop(fileArray) {
    if (fileArray) setUploadFile(fileArray);
  }

  async function uploadNewImage() {
    if (files.length) {
      if (parentId) {
        let failedToUpload = [];
        await Promise.all(files.map(async (image) => {
          const fileCreationResponse = await createFile({ setLoading, parentId, file: image });
          if (!fileCreationResponse) failedToUpload.push(image.name);
        }));
        if (failedToUpload.length) setUploadFile([]);
        else await refreshImageList(dispatch, setLoading);
        await ReactSwal.fire({
          title: "Atenção!",
          type: failedToUpload.length ? "warning" : "success",
          html: failedToUpload.length
            ? `
              <p>Erro ao salvar as seguintes imagens:</p>
              <ul>
                ${failedToUpload.map((imageName, index) => <li key={index}>${imageName}</li>)}
              </ul>
            ` : "Imagens salvas com sucesso.",
          showCloseButton: true
        });
      } else {
        await Swal.fire({
          title: "Atenção!",
          text: "Certifique-se de selecionar a pasta de destino no menu abaixo.",
          type: "warning",
          showCloseButton: true,
        });
      }
    } else {
      await Swal.fire({
        title: "Atenção!",
        text: "Selecione ao menos uma imagem com no mínimo 500px de largura e altura. Os formatos aceitos são: JPG, JPEG e PNG.",
        type: "warning",
        showCloseButton: true,
      });
    }
  }

  async function handleSearch() {
    if (searchInput) {
      const response = await listFilesWithFilterString({ filterString: searchInput, page: 1 });
      if (response) {
        const totalItemsFound = response.data.meta.total;
        const s = totalItemsFound > 1 ? "s" : "";
        const message = `${totalItemsFound} resultado${s} encontrado${s}.`
        dispatch(setSearchFileResult(response.data.data));
        dispatch(setFolderPagination(response.data.meta));
        toast(message, { type: toast.TYPE.INFO, autoClose: 6000 });
      }
    }
  }

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            <CRow>
              <CCol sm="12" md="8">
                <CLabel htmlFor="search-input">
                  Pesquisar
                </CLabel>
                <CInputGroup>
                  <CInput
                    id="search-input"
                    type="text"
                    value={searchInput}
                    title="pesquisar por nome da pasta, nome da imagem ou tag"
                    placeholder="pesquisar por nome da pasta, nome da imagem ou tag"
                    onChange={({ target }) => setSearchInput(target.value)}
                    onKeyPress={event => event.key === "Enter" && handleSearch()}
                  />
                  <CInputGroupAppend>
                    <CButton color="primary" onClick={handleSearch}>
                      <i className="cil-search mr-2 icon-fix"/> Buscar
                    </CButton>
                  </CInputGroupAppend>
                </CInputGroup>
              </CCol>
              <CCol sm="12" md="4" className="d-flex justify-content-end">
                <CButton color="info" className="mt-2 mt-sm-4" onClick={() => !collapse ? toggle() : uploadNewImage()}>
                  <i className="cil-cloud-upload icon-fix"/>&nbsp;{!collapse ? "Nova imagem" : "Salvar"}
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCollapse show={collapse}>
            <CCardBody>
              <ImageUploader
                withIcon={true}
                withLabel={true}
                onChange={onDrop}
                withPreview={true}
                singleImage={false}
                name="advertImage"
                maxFileSize={5242880}
                buttonText="Selecionar"
                imgExtension={[".jpg", ".jpeg", ".png"]}
                fileSizeError="Arquivo muito grande!"
                fileTypeError="Arquivo nao suportado."
                label="Resolucao mínima de 500px X 500px"
              />
            </CCardBody>
            <CCardFooter className="d-flex justify-content-center">
              <CButton color="secondary" variant="ghost" onClick={toggle}>
                <i className="cil-chevron-top px-4"/>
              </CButton>
            </CCardFooter>
          </CCollapse>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default ImagesStoreHeader;
