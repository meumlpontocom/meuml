import React      from "react";
import { CAlert } from "@coreui/react";
import { Link }   from "react-router-dom";

const ImageStorageLink = () => (
  <Link to="/hospedagem-imagens">Hospedagem de Imagens</Link>
);

const ImageStorageTip = () => (
  <CAlert color="info" className="d-flex align-items-center">
    <i className="cil-lightbulb mr-2"/>
    <p className="mb-0">
      <em>
        Para gerenciar sua imagem, acesse a <ImageStorageLink/> do MeuML.com!
      </em>
    </p>
  </CAlert>
);

export default ImageStorageTip;
