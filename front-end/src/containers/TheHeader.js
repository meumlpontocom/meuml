import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CHeader,
  CToggler,
  CHeaderBrand,
  CHeaderNav,
  CHeaderNavItem,
  CHeaderNavLink,
  CSubheader,
  CLink,
  CBreadcrumbRouter,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import routes from "../routes";

import logoDarkBG from "../assets/img/Logo-transparente.png";
import logoLightBG from "../assets/img/brand/MeuML-logo2.png";

import {
  TheHeaderDropdown,
  // TheHeaderDropdownMssg,
  // TheHeaderDropdownNotif,
  // TheHeaderDropdownTasks,
} from "./index";

const TheHeader = () => {
  const dispatch = useDispatch();
  const { darkMode, sidebarShow } = useSelector(state => state.coreui);

  const toggleSidebar = () => {
    const val = [true, "responsive"].includes(sidebarShow) ? false : "responsive";
    dispatch({ type: "setSidebarShow", sidebarShow: val });
  };

  const toggleSidebarMobile = () => {
    const val = [false, "responsive"].includes(sidebarShow) ? true : "responsive";
    dispatch({ type: "setSidebarShow", sidebarShow: val });
  };

  return (
    <CHeader withSubheader>
      <CToggler inHeader className="ml-md-3 d-lg-none" onClick={toggleSidebarMobile} />
      <CToggler inHeader className="ml-3 d-md-down-none" onClick={toggleSidebar} />
      <CHeaderBrand className="mx-auto d-lg-none" to="/home">
        {/* <CIcon name="logo" height="48" alt="Logo" /> */}
        <img
          width="230"
          src={darkMode ? logoDarkBG : logoLightBG}
          alt="MeuML.com"
          name="logo-negative"
          className="c-sidebar-bnd-full"
        />
      </CHeaderBrand>
      <CHeaderNav className="d-md-down-none mr-auto">
        <CHeaderNavItem className="px-3">
          <CHeaderNavLink to="/contas">
            <i className="cil-people mr-1" />
            Contas
          </CHeaderNavLink>
        </CHeaderNavItem>
        <CHeaderNavItem className="px-3">
          <CHeaderNavLink to="/processos">
            <i className="cil-list mr-1" />
            Processos
          </CHeaderNavLink>
        </CHeaderNavItem>
      </CHeaderNav>
      <CHeaderNav className="px-3">
        {/* <CToggler
          inHeader
          className="ml-3 d-md-down-none"
          onClick={() => dispatch({ type: "setDarkMode" })}
          title="Toggle Light/Dark Mode"
        >
          {darkMode ? (
            <i className="cil-moon" alt="CoreUI Icons Moon" />
          ) : (
            <i className="cil-sun" alt="CoreUI Icons Sun" />
          )}
        </CToggler> */}

        {/* <TheHeaderDropdownNotif />
        <TheHeaderDropdownTasks />
        <TheHeaderDropdownMssg />
        */}
        <TheHeaderDropdown />

        {/* <CToggler
          inHeader
          className="d-md-down-none"
          onClick={() => dispatch({ type: "setAsideShow" })}
        >
          <i size="lg" className="cil-applications-settings" />
        </CToggler> */}
      </CHeaderNav>
      <CSubheader className="px-3 justify-content-between">
        <CBreadcrumbRouter className="border-0 c-subheader-nav m-0 px-0 px-md-3" routes={routes} />
        <div className="d-md-down-none mfe-2 c-subheader-nav">
          <CLink className="c-subheader-nav-link" aria-current="page" to="/creditos/comprar">
            <CIcon name="cil-credit-card" alt="Créditos" />
            &nbsp;Créditos
          </CLink>
          <CLink className="c-subheader-nav-link" href="/#/sair">
            <i className="cil-account-logout" alt="Sair" />
            &nbsp;Sair
          </CLink>
        </div>
      </CSubheader>
    </CHeader>
  );
};

export default TheHeader;
