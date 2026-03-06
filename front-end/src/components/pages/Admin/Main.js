import React from "react";
import { Data } from "../../../containers/data/admin/AdminContainer";
import ControlPanel from "../../admin/ControlPanel";

const Main = () => (
  <Data.Consumer>
    {provider => <ControlPanel name={[provider.state.adminName]} />}
  </Data.Consumer>
);

export default Main;
