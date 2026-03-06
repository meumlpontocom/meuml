/* eslint-disable react-hooks/exhaustive-deps */
import {
  CCard,
  CCardBody,
  CForm,
  CFormGroup,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CLabel,
} from "@coreui/react";
import { useCallback } from "react";
import { FaUser } from "react-icons/fa";
import { useFetchUserPublicInfo } from "../hooks/useFetchUserPublicInfo";
import ButtonComponent from "src/components/ButtonComponent";

const SearchCard = () => {
  const [fetchAPI] = useFetchUserPublicInfo();

  const submitSearch = nickname => fetchAPI(nickname);

  const handleSearch = useCallback(
    event => {
      event.preventDefault();
      const query = event.target.elements.query.value;
      submitSearch(query);
    },
    [submitSearch],
  );

  return (
    <CCard style={{ width: "fit-content" }}>
      <CCardBody>
        <CForm onSubmit={handleSearch}>
          <CFormGroup>
            <CLabel htmlFor="searchInput">Procure informações de usuário através do apelido</CLabel>
            <CInputGroup className="mb-3 mt-3" style={{ width: "30rem" }}>
              <CInputGroupPrepend>
                <CInputGroupText>
                  <FaUser />
                </CInputGroupText>
              </CInputGroupPrepend>
              <CInput
                type="text"
                name="query"
                id="searchInput"
                placeholder="Digite o apelido de uma conta"
                disabled
              />
              <ButtonComponent
                title="Procurar"
                icon="cil-search"
                variant=""
                type="submit"
                className="ml-3"
                disabled
              />
            </CInputGroup>
          </CFormGroup>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default SearchCard;
