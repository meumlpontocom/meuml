import React                                                                     from "react";
import { CustomSection, MarketplacePublicationNotice, CatalogPublicationNotice } from "../atoms";

const PublishingMethodsSection = () => {
  return (
    <CustomSection id="publishing-methods" header="Publicação">
      <MarketplacePublicationNotice />
      <CatalogPublicationNotice />
    </CustomSection>
  );
};

export default PublishingMethodsSection;
