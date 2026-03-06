import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeAdvertImage,
  saveNewAdvertPicture,
  toggleIsLoading,
} from "../../../../../../redux/actions/_highQualityActions";
import api from "../../../../../../services/api";
import { getToken } from "../../../../../../services/auth";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import Button from "reactstrap/lib/Button";
import Swal from "sweetalert2";

export function AddNewPictureButton({ items }) {
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);
  const { accountId } = useSelector(state => state.highQualityAdvert);

  const savePicture = async ({ pictureTitle, picture }) => {
    try {
      dispatch(toggleIsLoading());

      const formData = new FormData();
      formData.append("account_id", accountId);
      formData.append("title", pictureTitle);
      formData.append("image", picture);
      const {
        data: { data, status, message },
      } = await api.post("/images/meli/upload", formData, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      dispatch(saveNewAdvertPicture(data.id));

      Swal.fire({
        title: "Atenção",
        text: message,
        type: status,
      });
    } catch (error) {
      Swal.fire({
        title: "Atenção",
        type: "error",
        text: error.response ? error.response.message : error.message ? error.message : error,
        showCloseButton: true,
      });
    } finally {
      dispatch(toggleIsLoading());
    }
  };

  function addNewImage({ target: { files } }) {
    const file = { pictureTitle: files[0].name, picture: files[0] };
    savePicture({ ...file });
  }

  function handleClick() {
    setUploading(!uploading);
    document.querySelectorAll("#upload-img-input")[0].click();
  }

  return (
    <>
      <input id="upload-img-input" type="file" accept="image/*" hidden={true} onChange={addNewImage} />
      <Button
        size="sm"
        color="success"
        onClick={handleClick}
        hidden={items.length === 10}
        className="rounded-circle"
      >
        <i className="cil-plus" />
      </Button>
    </>
  );
}

export function DeleteCurrentPictureButton({ items, activeIndex }) {
  const dispatch = useDispatch();

  function deleteImage() {
    dispatch(removeAdvertImage(activeIndex));
  }

  return (
    <Button size="sm" color="danger" onClick={deleteImage} hidden={!items.length} className="rounded close">
      <span aria-hidden="true">&times;</span>
    </Button>
  );
}

export function IndexControlButtons({ items, previous, next }) {
  return (
    <Row className="justify-content-around mr-2" style={{ width: "212px", marginBottom: "30px" }}>
      <Col xs="4">
        <Button hidden={!items.length} color="primary" size="sm" onClick={previous}>
          <i className="cil-arrow-circle-left mr-1" />
          Anterior
        </Button>
      </Col>
      <Col xs="4">
        <Button hidden={!items.length} color="primary" size="sm" onClick={next}>
          Próxima
          <i className="cil-arrow-circle-right ml-1" />
        </Button>
      </Col>
    </Row>
  );
}
