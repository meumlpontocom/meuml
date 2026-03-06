import { CardBody, Col, Row } from "reactstrap";
import { useDispatch } from "react-redux";
import ButtonComponent from "src/components/ButtonComponent";
import { useRef, useState } from "react";
import ProductCodeInput from "./ProductCodeInput";
import api from "src/services/api";
import { getToken } from "src/services/auth";
import Swal from "sweetalert2";

export default function AdvertFilters() {
  // const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [searchingError, setSearchingError] = useState("");

  const productCodeInputRef = useRef("");
  // const onlyDigitsRegex = new RegExp(/^\d+$/);

  async function searchAdByCode(e) {
    Swal.fire({
      title: "Função desabilitada pelo Mercado Livre",
      type: "error",
      html: `<div> Essa função foi desabilitada pelo Mercado Livre </div>`,
    });

    // e.preventDefault();
    // setIsLoading(true);
    // setSearchingError("");
    // const token = getToken();

    // const codeToSearch = productCodeInputRef.current;
    // const sanitizedId = codeToSearch.replaceAll("-", "").toUpperCase().trim();

    // const codeWithoutPrefix = sanitizedId.replace("MLB", "").replace("-", "");

    // const codeHasOnlyDigits = onlyDigitsRegex.test(codeWithoutPrefix);

    // if (sanitizedId.includes(" ") || !codeHasOnlyDigits) {
    //   Swal.fire({
    //     title: "Código de produto inválido",
    //     type: "warning",
    //     html: `<div>
    //       <p> Essa busca não parece ser para um código de anúncio válido. Para entender mais sobre isso, leia o aviso sobre o
    //       <b>Novo modo de busca de anúncios</b> no topo desta página </p>
    //     </div>`,
    //     showConfirmButton: true,
    //     confirmButtonText: "OK",
    //   });

    //   setIsLoading(false);
    //   return;
    // }

    // try {
    //   const response = await api.get("/search-ad-by-code/ml", {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //     params: {
    //       advertising_id: sanitizedId,
    //     },
    //   });

    //   const advertising = response.data.data;
    //   dispatch({ type: "REPLICATION_SAVE_ADVERTS", payload: [advertising] });
    // } catch (error) {
    //   setSearchingError(
    //     "Não foi possivel buscar o anuncio agora. Verifique se o código segue o padrão descrito acima, e tente novamente.",
    //   );
    // } finally {
    //   setIsLoading(false);
    // }
  }

  return (
    <CardBody>
      <form onSubmit={searchAdByCode}>
        <Row style={{ display: "flex", alignItems: "flex-end" }}>
          <Col xs={6} sm={7} md={4} lg={4} xl={4} className="mt-3">
            <ProductCodeInput inputRef={productCodeInputRef} />
          </Col>
          <Col xs={6} sm={7} md={4} lg={4} xl={4} className="mt-3">
            <ButtonComponent
              // disabled={isLoading}
              disabled={true}
              isLoading={isLoading}
              icon="cil-search"
              title="Pesquisar"
              variant=""
              width="100%"
            />
          </Col>
        </Row>
        {searchingError && (
          <div style={{ marginTop: "10px", fontSize: "14px", color: "red" }}> {searchingError} </div>
        )}
      </form>
    </CardBody>
  );
}
