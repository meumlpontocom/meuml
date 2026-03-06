import React, { useContext, useCallback } from "react";
import { CButton }                        from "@coreui/react";
import styled                             from "styled-components";
import { createMlAdvertContext }          from "../createMlAdvertContext";

const RemovePictureBtn = ({ file }) => {
  const { form, setFormData } = useContext(createMlAdvertContext);
  const setUpdatedImageList = useCallback(fresh => setFormData({ id: "images", value: fresh }), [setFormData]);

  const CloseBtn = styled(CButton)`
    position: absolute;
  `;


  function handleCloseBtnClick() {
    setUpdatedImageList(form.images.filter(pictureFile => pictureFile.name !== file.name));
  }

  return (
    <CloseBtn className="close" onClick={handleCloseBtnClick}>
      <span aria-hidden="true">&times;</span>
    </CloseBtn>
  );
};

export default RemovePictureBtn;
