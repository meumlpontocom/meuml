import { CCard, CCardBody, CCol, CRow } from "@coreui/react";
import { IoWarningOutline } from "react-icons/io5";
import BuyCreditsBtn from "./BuyCreditsBtn";
import CancelButton from "./CancelButton";
import ConfirmReplicationBtn from "./ConfirmReplicationBtn";
import Swal from "sweetalert2";

export default function ConfirmationFooter() {
  function showNoImagesInfo() {
    Swal.fire({
      html: `<p style='text-align: justify;'>Devido à diferença de regras entre Mercado Livre e Shopee, em relação à quantidade de fotos por
            anúncio, o MeuML cria as variações na Shopee <b>sem fotos</b>. Portanto é necessário que você,
            vendedor, faça a revisão de seus anúncios após a replicação!</p>`,
      type: "info",
      showCloseButton: true,
    });
  }

  return (
    <CCard>
      <CCardBody>
        <div
          style={{
            fontSize: "15px",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            flex: 1,
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <IoWarningOutline size={22} color="#a97f00" />
          <span>
            Atenção! As variações do anúncio serão criadas <b>sem fotos</b>.{" "}
            <span onClick={showNoImagesInfo} style={{ color: "blue", fontWeight: "bold", cursor: "pointer" }}>
              Saiba mais
            </span>
          </span>
        </div>
        <CRow>
          <CCol>
            <CancelButton />
          </CCol>
          <CCol>
            <BuyCreditsBtn />
            <ConfirmReplicationBtn />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
}
