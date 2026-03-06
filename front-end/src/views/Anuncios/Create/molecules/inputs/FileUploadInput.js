import React from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { CInput } from "@coreui/react";
import { FileUploadLabel } from "src/views/Anuncios/Create/atoms";

const FileUploadInput = ({ images, setFormData, rest }) => {
  const fileSize = f => f.size;
  const fileType = f => f.type.split("/").pop().toLowerCase();
  const isValidFileSize = f => fileSize(f) <= 5000000;
  const isValidFileType = f => fileType(f) === "jpeg" || fileType(f) === "jpg" || fileType(f) === "png";

  const toastInvalidImgSize = () =>
    toast("Esta imagem excede o tamanho máximo de 5mb.", {
      type: toast.TYPE.ERROR,
      autoClose: 8000,
      toastId: "file big",
    });
  const toastInvalidImgFormat = () =>
    toast(
      "Formato inválido! Certifique se de que o formato do arquivo seja um dos seguintes: .PNG, .JPG ou .JPEG.",
      {
        type: toast.TYPE.ERROR,
        autoClose: 8000,
        toastId: "file format not valid",
      },
    );

  const onFileChange = filesObject => {
    const fileList = Object.values(filesObject);
    const validFiles = fileList.reduce((valid, file) => {
      if (isValidFileType(file)) return [...valid, file];
      if (!isValidFileSize(file)) toastInvalidImgSize();
      if (!isValidFileType(file)) toastInvalidImgFormat();
      return valid;
    }, []);
    setFormData({ id: "images", value: [...images, ...validFiles] });
  };
  return (
    <div className="custom-file">
      <CInput
        {...rest}
        type="file"
        multiple="multiple"
        className="custom-file-input"
        onChange={event => onFileChange(event.target.files)}
      />
      <FileUploadLabel>Selecionar imagem</FileUploadLabel>
    </div>
  );
};

FileUploadInput.propTypes = {
  rest: PropTypes.object,
  images: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default FileUploadInput;
