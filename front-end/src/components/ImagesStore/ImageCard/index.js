import React from "react";

import { CCol, CCard } from "@coreui/react";

import ImageCardHeader from "./ImageCardHeader";
import ImageCardBody   from "./ImageCardBody";

import styles    from "./styles.module.scss";
import { toast } from "react-toastify";

const ImageCard = ({ id, setLoading }) => {
  function copyImageLink(url) {
    navigator.clipboard.writeText(url);
    toast("Link copiado com sucesso!", { type: toast.TYPE.INFO, autoClose: 3000 });
  }

  return (
    <CCol xs="12" sm="6" md="4" lg="4" xl="3" className={styles.imagecardWidth}>
      <CCard>
        <ImageCardHeader id={id} setLoading={setLoading} copyImageLink={copyImageLink}/>
        <ImageCardBody id={id} setLoading={setLoading} copyImageLink={copyImageLink}/>
      </CCard>
    </CCol>
  );
};

export default ImageCard;
