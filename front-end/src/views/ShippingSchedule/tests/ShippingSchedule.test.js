import React            from "react";
import { shallow }      from "enzyme"
import ShippingSchedule from "../index";

it("renders without crashing", () => {
  shallow(<ShippingSchedule />);
});
