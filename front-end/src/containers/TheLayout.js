import React from "react";
import { useSelector } from "react-redux";
import classNames from "classnames";
import {
  TheContent,
  TheSidebar,
  TheAside,
  TheFooter,
  TheHeader,
  TheHelp
} from "./index";
import { AccountContainer } from "./Data";
import AuthHandler from "./AuthHandler";

const TheLayout = () => {
  const darkMode = useSelector((state) => state.coreui.darkMode);
  const classes = classNames(
    "c-app c-default-layout",
    darkMode && "c-dark-theme"
  );

  return (
    <div className={classes}>
      <AuthHandler>
        <AccountContainer>
          <TheSidebar />
          <TheAside />
          <div className="c-wrapper">
            <TheHeader />
            <div className="c-body">
              <TheContent />
            </div>
            <TheFooter />
            <TheHelp />
          </div>
        </AccountContainer>
      </AuthHandler>
    </div>
  );
};

export default TheLayout;
