import React                      from "react";
import Page                       from "src/views/WhatsAppConfig/Page";
import { WhatsAppConfigProvider } from "src/views/WhatsAppConfig/context";

const WhatsAppConfig = () => {
  return (
    <WhatsAppConfigProvider>
      <Page />
    </WhatsAppConfigProvider>
  );
};

export default WhatsAppConfig;
