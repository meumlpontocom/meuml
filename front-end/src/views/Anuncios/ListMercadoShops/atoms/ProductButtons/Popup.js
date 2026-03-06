import React                from "react";
import Swal                 from "sweetalert2";
import { CContainer, CCol } from "@coreui/react";
import withReactContent     from "sweetalert2-react-content";

export default function Popup({
  btnTitle,
  popupConfirmBtnText,
  popupCancenlBtnText,
  disabled,
  popupTitle,
  popupType = null,
  product,
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
        <CContainer>
          <CCol sm="12" md="12" lg="12" xs="12">
            <table className="mb-3">
              <tbody>
                <tr>
                  <td>
                    <img
                      src={product.external_data.secure_thumbnail}
                      alt="Thumbnail do anúncio"
                    />
                  </td>
                  <td>
                    <p>{product.title}</p>
                    <p>
                      <small>
                        {product.external_id}
                      </small>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </CCol>
          <CCol sm="12" md="12" lg="12" xs="12">
            {inputArea}
          </CCol>
        </CContainer>
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
