import React from "react";
import { CDropdown, CDropdownToggle, CImg } from "@coreui/react";
import { useSelector } from "react-redux";
import LoadingCardData from "src/components/LoadingCardData";
import styled from "styled-components";

const HeaderDropDownStyles = styled.div`
  @media (max-width: 400px) {
    .c-header-nav-items {
      display: none;
    }
  }
`;

const TheHeaderDropdown = () => {
  const { accounts, isLoading } = useSelector(({ accounts }) => accounts);
  const firstAccount = Object.values(accounts)[0];
  return (
    <HeaderDropDownStyles>
      <CDropdown inNav className="c-header-nav-items mx-2" direction="down">
        <CDropdownToggle className="c-header-nav-link" caret={false}>
          <div className="c-avatar">
            {isLoading ? (
              <LoadingCardData />
            ) : (
              <CImg
                src={`https://ui-avatars.com/api/?name=${firstAccount?.name}`}
                className="c-avatar-img"
                alt="admin@bootstrapmaster.com"
              />
            )}
          </div>
        </CDropdownToggle>
        {/*
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem header tag="div" color="light" className="text-center">
          <strong>{firstAccount?.name}</strong>
        </CDropdownItem>
         <CDropdownItem>
          <CIcon name="cil-bell" className="mfe-2" />
          Novidades
          <CBadge color="info" className="mfs-auto">
            1
          </CBadge>
        </CDropdownItem>
        <CDropdownItem divider />
        <CDropdownItem>
          <CIcon name="cil-envelope-open" className="mfe-2" />
          Mensagens
          <CBadge color="success" className="mfs-auto">
            4
          </CBadge>
        </CDropdownItem>
        <CDropdownItem>
          <CIcon name="cil-task" className="mfe-2" />
          Vendas
          <CBadge color="danger" className="mfs-auto">
            2
          </CBadge>
        </CDropdownItem>
      </CDropdownMenu>*/}
      </CDropdown>
    </HeaderDropDownStyles>
  );
};

export default TheHeaderDropdown;
