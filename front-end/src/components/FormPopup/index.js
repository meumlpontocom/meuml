import React from "react";
import Swal from "sweetalert2";
import { Container, Col } from "reactstrap";
import withReactContent from "sweetalert2-react-content";

export default function FormPopup({
  btnTitle,
  popupConfirmBtnText,
  popupCancenlBtnText,
  disabled,
  popupTitle,
  popupType = null,
  advert,
  inputArea,
  popupAction
}) {
  const ReactSwal = withReactContent(Swal);
  const btnClassName = `dropdown-item ${disabled ? "disabled" : ""}`;
  const handleClick = () => {
    ReactSwal.fire({
      type: popupType,
      title: popupTitle,
      html: (
        <Container>
          <Col sm="12" md="12" lg="12" xs="12">
            <table className="mb-3">
              <tbody>
                <tr>
                  <td>
                    <img
                      src={advert.external_data.secure_thumbnail}
                      alt="Thumbnail do anúncio"
                    />
                  </td>
                  <td>
                    <p>{advert.title}</p>
                    <p>
                      <small>
                        {advert.external_id}
                      </small>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </Col>
          <Col sm="12" md="12" lg="12" xs="12">
            {inputArea}
          </Col>
        </Container>
      ),
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: popupCancenlBtnText || "Cancelar",
      confirmButtonText: popupConfirmBtnText || "Confirmar"
    }).then(response => {
      if (response.value) {
        popupAction();
      }
    });
  };
  return (
    <div className={btnClassName} onClick={() => handleClick()} style={{cursor: "pointer"}}>
      {btnTitle}
    </div>
  );
}
