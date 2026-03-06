import React           from "react";
import Image           from "src/views/ProductRegistration/ImagesCard/Image";
import { useSelector } from "react-redux";
import { CCol, CRow, CTabContent, CTabPane } from "@coreui/react";

function Images() {
  const currentDirectoryImages = useSelector(state => state.newProduct.images.currentDirectoryImages);
  const currentDirectoryID = useSelector(state => state.newProduct.images.currentDirectoryID);

  const ImageList = () => {
    if (currentDirectoryImages?.length) {
      return currentDirectoryImages.map(image => (
        <Image
          key={image.id}
          id={image.id}
          name={image.name}
          url={image.thumbnail_url}
        />
      ));
    }

    return (
      <CCol xs={12}>
        <h5 className="text-muted">
          <i className="icon-fix cil-ban" />&nbsp;Não há imagens a serem exibidas.
        </h5>
      </CCol>
    );
  };

  return (
    <CTabContent id="tab-content">
      <CTabPane className="mt-0 mt-sm-5" active={!!currentDirectoryID === false}>
        <CCol className="text-center">
          <h5 className="text-muted">
            <i className="icon-fix cil-folder" />&nbsp;Selecione uma pasta.
          </h5>
        </CCol>
      </CTabPane>
      <CTabPane active={!!currentDirectoryID === true} id="selected-directory-tab">
        <CRow style={{ margin: "0px" }} className="d-flex justify-content-center">
          <ImageList />
        </CRow>
      </CTabPane>
    </CTabContent>
  );
}

export default Images;
