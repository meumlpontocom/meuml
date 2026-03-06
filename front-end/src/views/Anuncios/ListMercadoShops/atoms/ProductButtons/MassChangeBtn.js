import React, {useMemo} from "react";
import {useSelector} from "react-redux";
import {CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem} from "@coreui/react";

export default function MassChangeBtn() {
  const {
    products,
    allProductsSelected,
  } = useSelector((state) => state.mshops);

  const moreThanOneAdSelected = useMemo(() => {
    if (allProductsSelected)
      return true;
    let counter = 0;
    for (const product in products) {
      if (products.hasOwnProperty(product)) {
        if (products[product].selected ) counter++;
      }
    }
    return counter > 1;
  }, [products, allProductsSelected]);

  function Option({url, children}) {
    return (
      <CDropdownItem
        disabled={!moreThanOneAdSelected}
        title={
          moreThanOneAdSelected
            ? "Ir para Alterações em Massa"
            : "Selecione ao menos um anúncio"
        }
        to={{
          pathname: url,
        }}
      >
        {children}
      </CDropdownItem>
    );
  }

  return (
    <>
      <CDropdown caret color="secondary">
        <CDropdownToggle>
          <i className="cil-layers mr-1" />
          Alterações em Massa
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem header>
            Opções
          </CDropdownItem>
          <Option url="/anuncios/mercado-shops/atualizar-status-em-massa">
            Atualizar status em massa
          </Option>
        </CDropdownMenu>
      </CDropdown>
    </>
  );
}
