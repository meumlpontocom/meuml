import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CCreateElement,
  CSidebar,
  CSidebarNav,
  CSidebarNavDivider,
  CSidebarNavTitle,
  CSidebarMinimizer,
  CSidebarNavDropdown,
  CSidebarNavItem,
  CSidebarBrand,
} from "@coreui/react";
import navigation from "./_nav";
import logoDarkBG from "../assets/img/Logo-transparente.png";
import logoLightBG from "../assets/img/brand/MeuML-logo2.png";
import sygnet from "../assets/img/brand/sygnet.png";

const TheSidebar = () => {
  const dispatch = useDispatch();
  const show = useSelector((state) => state.coreui.sidebarShow);
  const darkMode = useSelector((state) => state.coreui.darkMode);

  return (
    <CSidebar
      show={show}
      unfoldable
      onShowChange={(val) =>
        dispatch({ type: "setSidebarShow", sidebarShow: val })
      }
    >
      <CSidebarBrand
        className={darkMode ? "d-md-down-none" : "d-md-down-none bg-white"}
        to="/home"
      >
        <img
          width="230"
          src={darkMode ? logoDarkBG : logoLightBG}
          alt="MeuML.com"
          name="logo-negative"
          className="c-sidebar-brand-full"
        />
        <img
          width="30"
          src={sygnet}
          alt="MeuML.com"
          name="sygnet"
          className="c-sidebar-brand-minimized"
        />
      </CSidebarBrand>
      <CSidebarNav>
        <CCreateElement
          items={navigation}
          components={{
            CSidebarNavDivider,
            CSidebarNavDropdown,
            CSidebarNavItem,
            CSidebarNavTitle,
          }}
        />
      </CSidebarNav>
      <CSidebarMinimizer className="c-d-md-down-none" />
    </CSidebar>
  );
};

export default React.memo(TheSidebar);
