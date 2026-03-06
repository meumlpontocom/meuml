import React from "react";
import Page from "./Page";
import { InventoryProvider } from "./InventoryContext";

const Inventory = () => {
  return (
    <InventoryProvider>
      <Page />
    </InventoryProvider>
  );
};

export default Inventory;
