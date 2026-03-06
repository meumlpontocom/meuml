import React, { useMemo }                 from "react";
import Swal                               from "sweetalert2";
import {
  CInputCheckbox,
  CCardHeader,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
}                                         from "@coreui/react";
import styles                             from "./styles.module.scss";
import { toast }                          from "react-toastify";
import { saveAs }                         from "file-saver";
import { useDispatch, useSelector }       from "react-redux";
import { createFilesTags, deleteFile }    from "src/views/ImagesStore/requests";
import refreshImageList                   from "../../../views/ImagesStore/refreshImageList";
import { setImageStorePictureIsSelected } from "src/redux/actions";

const ImageCardHeader = ({ id, setLoading, copyImageLink }) => {
  const dispatch = useDispatch();
  const { images, selectedPictures, selectAllPictures } = useSelector(({ imageStorage }) => imageStorage.files);
  const image = useMemo(() => images.filter(image => image.id === id)[0] ?? {}, [id, images]);

  const checked = useMemo(() => {
    if (!selectAllPictures) return !!selectedPictures.filter(imgId => imgId === image.id)?.length;
    else return !!!selectedPictures.filter(imgId => imgId === image.id)?.length;
  }, [image, selectedPictures, selectAllPictures]);

  function downloadFile() {
    const imageUrl = `https://${image.url}`;
    saveAs(imageUrl, image.name);
  }

  async function deleteImage() {
    const fileDeletionResponse = await deleteFile({ setLoading, fileId: image.id });
    if (fileDeletionResponse) {
      toast(fileDeletionResponse.data.message, { type: toast.TYPE.SUCCESS });
      await refreshImageList(dispatch, setLoading);
    }
  }

  async function updateImageTags() {
    const newTags = await Swal.fire({
      type: "question",
      title: `Tags do arquivo "${image.name}"`,
      text: "Digite no campo abaixo as tags que pertencem a este arquivo:",
      input: "textarea",
      inputPlaceholder: "Exemplo: Tag1, Tag2, Tag3",
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      showConfirmButton: true,
      confirmButtonText: "Salvar",
    });
    if (newTags.value?.length && newTags.value[0] !== "") {
      const payload = {
        data: {
          type: "tag_files",
          attributes: {
            tags: newTags ? newTags.value.split(",") : [],
            files_id: [image.id],
          },
        },
      };
      const tagUpdateResponse = await createFilesTags({
        payload,
        setLoading,
        parentId: image.parent_id,
      });
      if (tagUpdateResponse) {
        toast(tagUpdateResponse.data.message, { type: toast.TYPE.SUCCESS });
        refreshImageList(dispatch, setLoading);
      }
    }
  }

  function toggleImageIsChecked(event) {
    dispatch(setImageStorePictureIsSelected(image.id, event.target.checked));
  }

  return (
    <CCardHeader
      className={styles.imagecardContainer}
      style={{ backgroundImage: `url(https://${image.thumbnail_url})` }}
    >
      <div className="d-flex justify-content-between w-100">
        <div>
          <CInputCheckbox checked={checked} onChange={toggleImageIsChecked} className="ml-0"/>
        </div>
        <CDropdown className={styles.imgCardDdmenu}>
          <CDropdownToggle color="primary" variant="" className="pb-0">
            <i className="cil-cog mr-1"/>
          </CDropdownToggle>
          <CDropdownMenu className="p-0" placement="bottom-end">
            <CDropdownItem onClick={() => copyImageLink(image.url)}>Copiar link</CDropdownItem>
            <CDropdownItem onClick={updateImageTags}>Criar tags</CDropdownItem>
            <CDropdownItem onClick={downloadFile}>Download</CDropdownItem>
            <CDropdownItem onClick={deleteImage}>Excluir</CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </div>
    </CCardHeader>
  );
};

export default ImageCardHeader;
