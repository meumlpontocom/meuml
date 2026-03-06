/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from "@coreui/react";

export default function MassChangesBtn({ history }) {
  const selectedAdverts = useSelector(state => state.selectedAdverts);
  const moreThanOneAdSelected = useMemo(() => {
    if (
      selectedAdverts.allChecked ||
      selectedAdverts.pagesAllChecked ||
      Object.keys(selectedAdverts.advertsArray).length
    )
      return true;
    const { advertsArray } = selectedAdverts;
    let counter = 0;
    for (const advert in advertsArray) {
      if (advertsArray.hasOwnProperty(advert)) {
        if (advertsArray[advert].checked) counter++;
      }
    }
    return counter > 1;
  }, [selectedAdverts.pagesAllChecked, selectedAdverts]);

  function Option({ url, children }) {
    return (
      <CDropdownItem
        disabled={!moreThanOneAdSelected}
        title={moreThanOneAdSelected ? "Ir para Alterações em Massa" : "Selecione ao menos um anúncio"}
        onClick={() => history.push(url)}
      >
        {children}
      </CDropdownItem>
    );
  }

  return (
    <>
      <CDropdown caret color="secondary">
        <CDropdownToggle style={{ width: "100%" }}>
          <i className="cil-layers mr-1" />
          Alterações em Massa
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem header>Opções</CDropdownItem>
          <Option url="/anuncios/alterar-header-footer-em-massa">Texto de cabeçalho e rodapé</Option>
          <Option url="/anuncios/alterar-precos-em-massa">Alterar preço em massa</Option>
          <Option url="/anuncios/descontos-em-massa">Aplicar desconto em massa</Option>
          <Option url="/anuncios/alterar-texto-fixo-em-massa">Alterar texto fixo em massa</Option>
          <Option url="/anuncios/substituir-texto-descricao-em-massa">
            Substituir texto descrição em massa
          </Option>
          <Option url="/anuncios/atualizar-status-em-massa">Atualizar status em massa</Option>
          <Option url="/anuncios/atualizar-prazo-de-envios-em-massa">
            Atualizar Prazo de Envios em Massa
          </Option>
          <Option url="/anuncios/atualizar-status-envio-flex">Atualizar Status de Envio Flex em Massa</Option>
        </CDropdownMenu>
      </CDropdown>
    </>
  );
}
