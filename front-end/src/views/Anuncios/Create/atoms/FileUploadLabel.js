import styled     from "styled-components";
import { CLabel } from "@coreui/react";

const FileUploadLabel = styled(CLabel)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1;
  height: calc(1.5em + 0.75rem + 2px);
  padding: 0.375rem 0.75rem;
  font-weight: 400;
  line-height: 1.5;
  border: 1px solid;
  border-radius: 0.25rem;
  color: #768192;
  background-color: #fff;
  border-color: #d8dbe0;

  ::after {
    content: "Pesquisar";
    right: 0;
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 3;
    display: block;
    height: calc(1.5em + 0.75rem);
    padding: 0.375rem 0.75rem;
    line-height: 1.5;
    border-left: inherit;
    border-radius: 0 0.25rem 0.25rem 0;
    color: #768192;
    background-color: #ebedef;
  }
`;

export default FileUploadLabel;
