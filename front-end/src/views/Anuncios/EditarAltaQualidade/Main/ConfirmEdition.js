import React from "react";
import Col from "reactstrap/lib/Col";
import Button from "reactstrap/lib/Button";
import api from "../../../../services/api";
import { getToken } from "../../../../services/auth";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleIsLoading,
  saveErrors,
} from "../../../../redux/actions/_highQualityActions";
import Swal from "sweetalert2";

export default function ConfirmEdition() {
  const dispatch = useDispatch();
  const advert = useSelector((state) => state.highQualityAdvert.advertData);
  const loading = useSelector((state) => state.highQualityAdvert.isLoading);

  async function fetchEditHighQualityProps() {
    try {
      dispatch(toggleIsLoading());
      const url = "/catalog/edit-high-quality";
      const {
        data: {
          data: { errors },
          status,
          message,
        },
      } = await api.post(
        url,
        {
          data: {
            type: "advertising_high_quality_properties",
            attributes: {
              ...advert,
            },
          },
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      if (errors?.length) dispatch(saveErrors(errors));

      Swal.fire({
        title: "Atenção",
        type: status,
        text: message,
        showCloseButton: true,
      });
    } catch (error) {
      Swal.fire({
        title: "Atenção",
        type: "error",
        text: error.response
          ? error.response.data.message
          : error.message
          ? error.message
          : error,
        showCloseButton: true,
      });

      if (error.response && error.response.data.errors?.length)
        dispatch(saveErrors(error.response.data.errors));
    } finally {
      dispatch(toggleIsLoading());
    }
  }

  function handleClick() {
    fetchEditHighQualityProps();
  }

  return (
    <Col xs="12">
      <Button color="success" onClick={handleClick} disabled={loading}>
        <i className="cil-check mr-1" />
        Salvar
      </Button>
    </Col>
  );
}
