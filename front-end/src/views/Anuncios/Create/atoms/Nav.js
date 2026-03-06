import React, { useState }                   from "react";
import { CNav, CNavbar, CNavItem, CNavLink } from "@coreui/react";

const Nav = ({ callback }) => {
  const [activeLink, setActiveLink] = useState(() => 0);

  const handleClickNavLink = index => {
    setActiveLink(index);
    callback(index);
  };

  return (
    <CNavbar>
      <CNav inCard variant="tabs">
        <CNavItem onClick={() => handleClickNavLink(0)}>
          <CNavLink className={activeLink === 0 ? "active" : ""}>
            Obrigatórios
          </CNavLink>
        </CNavItem>
        <CNavItem onClick={() => handleClickNavLink(1)}>
          <CNavLink className={activeLink === 1 ? "active" : ""} >
            Opcionais
          </CNavLink>
        </CNavItem>
      </CNav>
    </CNavbar>
  );
};

export default Nav;
