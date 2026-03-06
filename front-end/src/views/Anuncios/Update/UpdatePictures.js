import React, { useContext, useRef } from "react";
import Carousel from "./Carousel";
import CIcon from "@coreui/icons-react";
import UpdateAdvertContext from "./UpdateAdvert.Context";
import { CButton, CRow, CCol, CInput, CInputGroup } from "@coreui/react";

function UpdatePictures() {
  const fileInputRef = useRef(null);
  const {
    pictures,
    removePicture,
    setAdvertPictures,
    loading,
    request,
    accountId,
    activeIndex,
    updateActiveIndex
  } = useContext(UpdateAdvertContext);

  const uploadPicture = async event => {
    const picture = await request
      .fetchUploadImage(event.target.files[0], accountId)
      .then(data => data);

    if (picture) {
      setAdvertPictures([{
        id: picture.id,
        max_size: "",
        size: "",
        secure_url: `https://mlb-s2-p.mlstatic.com/${picture.id}-I.jpg`
      }]);
    }
  };

  function handleInputFileClick() {
    fileInputRef.current.click();
  }

  return (
    <CCol className="text-center mt-4">
      <Carousel
        pictures={pictures}
        setActiveIndex={updateActiveIndex}
        activeIndex={activeIndex}
      />
      <CRow className="mt-3">
        <CCol colSpan={4}>
          <CButton className="fake-browse-btn float-right" color="primary" onClick={handleInputFileClick}>
            <CIcon className="mr-1" name="cil-search" />
              Procurar Imagem
          </CButton>
          <CInputGroup className="mb-3">
            <CInput
              innerRef={fileInputRef}
              type="file"
              id="inputGroupFile"
              multiple="multiple"
              onChange={event => uploadPicture(event)}
              className="custom-file"
              enctype="multipart/form-data"
              accept="image/x-png,image/jpeg"
              disabled={loading}
            />
          </CInputGroup>
        </CCol>
        <CCol colSpan={4}>
          <CButton className="float-left" color="danger" onClick={removePicture}>
            <CIcon name="cil-x" className="mr-1" />
            Remover Imagem
          </CButton>
        </CCol>
      </CRow>
    </CCol>
  );
}

export default UpdatePictures;
