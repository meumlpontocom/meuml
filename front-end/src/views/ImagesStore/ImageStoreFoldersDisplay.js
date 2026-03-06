import React, { useState, useEffect } from "react";
import Swal                           from "sweetalert2";
import styles                         from "./styles.module.scss";
import { toast }                      from "react-toastify";
import ImagesFolder                   from "../../components/ImagesStore/ImagesFolder";
import LoadingCardData                from "../../components/LoadingCardData";
import refreshDirectories             from "./refreshDirectories";
import { useDispatch, useSelector }   from "react-redux";
import { createDiretory, deleteFile } from "./requests";
import getWidth                       from "src/helpers/getWindowWidth";
import {
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CBadge,
}                                     from "@coreui/react";

const ImageStoreFoldersDisplay = () => {
    const dispatch = useDispatch();
    const [toggle, setToggle] = useState(false);
    const [windowWidth, setWindowWidth] = useState(getWidth());
    const [isLoading, setLoading] = useState(() => false);
    const [componentHeight, setComponentHeight] = useState(0);
    const { total } = useSelector(({ imageStorage }) => imageStorage.currentFolderPagination);
    const { folders, selectedPictures, selectAllPictures } = useSelector(({ imageStorage }) => imageStorage.files);

    useEffect(() => {
      const outterHeight = document.querySelector(".c-main").clientHeight;
      const height = (outterHeight - 118) / 2;
      setComponentHeight(height);
    }, []);

    useEffect(() => {
      if (windowWidth < 540) setToggle(true);
      else {
        if (windowWidth > 541) setToggle(false);
      }
    }, [windowWidth]); //eslint-disable-line

    useEffect(() => {
      const widthListener = () => setWindowWidth(getWidth());
      window.addEventListener("resize", widthListener);
      return () => window.removeEventListener("resize", widthListener);
    }, []);

    function handleClickToggle() {
      setToggle(!toggle);
    }

    async function deleteFolder() {
      const selectedFolder = folders.filter(folder => folder.isSelected);
      if (selectedFolder.length) {
        const userResponse = await Swal.fire({
          title: `Apagar "${selectedFolder[0].name}"`,
          html: `
        <p>
            Ao apagar esta pasta as imagens contidas nela também serão removidas.&nbsp;
            Digite o nome da pasta (${selectedFolder[0].name}) no campo abaixo para apagá-la:
        </p>
        `,
          type: "warning",
          input: "text",
          inputPlaceholder: `Digite "${selectedFolder[0].name}" para apagar a pasta`,
          showCloseButton: true,
          showCancelButton: true,
          cancelButtonText: "Cancelar",
          showConfirmButton: true,
          confirmButtonText: "Deletar",
        });
        if (userResponse.value === selectedFolder[0].name) {
          const deleteFileResponse = await deleteFile({ setLoading, fileId: selectedFolder[0].id });
          if (deleteFileResponse) {
            toast(deleteFileResponse.data.message, { type: toast.TYPE.SUCCESS, autoClose: 7000 });
            refreshDirectories({ dispatch, setLoading });
          }
        }
      } else {
        Swal.fire({
          title: "Atenção!",
          text: "Escolha uma pasta para ser apagada clicando sobre ela.",
          type: "warning",
          showCloseButton: true,
        });
      }
    }

    async function handleNewDirectoryClick() {
      const user = await Swal.fire({
        title: "Nome da pasta",
        html: "<p>Digite um nome para a nova pasta:</p>",
        type: "question",
        input: "text",
        showCloseButton: true,
      });
      if (!user.value) {
        if (!user.dismiss) {
          await Swal.fire({
            type: "warning",
            title: "Atenção",
            text: "Certifique-se de digitar um nome para a nova pasta.",
            showCloseButton: true,
          });
        }
      } else {
        const config = { setLoading, directoryName: user.value };
        const directoryCreationResponse = await createDiretory({ ...config });
        if (directoryCreationResponse) {
          toast(directoryCreationResponse.data.message, { type: toast.TYPE.SUCCESS, autoClose: 7000 });
          await refreshDirectories({ dispatch, setLoading });
        }
      }
    }

    const SelectionData = () => {
      const selectedPicturesAmount = selectAllPictures ? total - selectedPictures.length : selectedPictures.length;
      const plural = selectedPicturesAmount > 1;
      if (!toggle) {
        if (!selectAllPictures) {
          return (
            <h5 className="text-center mt-2">
              <CBadge color="success">
                {selectedPicturesAmount || "Nenhuma"} {plural ? "imagens" : "imagem"} {plural ? "selecionadas" : "selecionada"}
              </CBadge>
            </h5>
          );
        }
        return !selectedPictures.length
               ? (
                 <h5 className="text-center mt-2">
                   <CBadge color="success">Todas as imagens selecionadas</CBadge>
                 </h5>
               ) : (
                 <h5 className="text-center mt-2">
                   <CBadge color="success">
                     {selectedPicturesAmount} imagens selecionadas
                   </CBadge>
                 </h5>
               );
      }
      return <></>;
    };

    return (
      <CCard className={toggle ? styles.folderColapse : styles.folderOpen}>
        <CCardHeader className="d-flex align-items-center px-3">
          <h4 className={toggle ? "d-none" : "mb-0 mr-auto text-info"}>
            <i className="cil cil-folder icon-fix mr-1"/>
            Pastas
          </h4>
          <CButton
            onClick={handleClickToggle}
            color="secondary"
            size="sm"
            className={toggle ? styles.buttonPositioning : ""}
          >
            <i className={toggle ? "cil-caret-right icon-fix" : "cil-caret-left icon-fix"}/>
          </CButton>
        </CCardHeader>
        <CCardBody className="overflow-hidden p-1">
          <CDropdown hidden={toggle} className="ml-1 mt-1 mb-1">
            <CDropdownToggle color="secondary">
              Opções
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={handleNewDirectoryClick}>Criar pasta</CDropdownItem>
              <CDropdownItem onClick={deleteFolder}>Apagar pasta</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
          <SelectionData/>
          {isLoading
           ? <LoadingCardData/>
           : <div
             className={`d-flex flex-column rounded ${styles.foldersContainer}`}
             style={{ opacity: toggle ? "0" : "1", minHeight: `${componentHeight}px` }}
           >
             {folders.map(folder => <ImagesFolder id={folder.id} key={folder.id}/>)}
           </div>}
        </CCardBody>
      </CCard>
    );
  }
;

export default ImageStoreFoldersDisplay;
