import styled from "styled-components";
import { DropDown } from "../../../../buttons/ButtonGroup";
import AlterManufacturingTime from "./AlterManufacturingTime";
import AlterText from "./AlterText";
import CatalogCharts from "./CatalogCharts";
import DiscountBtn from "./DiscountBtn";
import FlexShipping from "./FlexShipping";
import HeaderFooter from "./HeaderFooter";
import RemoveDiscountBtn from "./RemoveDiscountBtn";
import ReplaceText from "./ReplaceText";

const DropDownMenuStyles = styled.div`
  .dropdown-menu {
    min-width: fit-content;
  }
`;

export default function AdvertOptionsBtn({ advertId, ad }) {
  return (
    <DropDownMenuStyles>
      <DropDown
        direction="left"
        caret={true}
        color="primary"
        title={
          <span>
            <i className="cil-cog mr-1 mt-1" />
            Opções
          </span>
        }
        className="options-button"
      >
        <DiscountBtn advert={ad} />
        <RemoveDiscountBtn
          originalPrice={ad.original_price}
          tags={ad.external_data.tags || []}
          id={advertId}
        />
        <HeaderFooter advert={ad} />
        <ReplaceText advert={ad} />
        <AlterText advert={ad} />
        <AlterManufacturingTime advert={ad} />
        <FlexShipping advert={ad} />
        <CatalogCharts id={advertId} title={ad.title} categoryId={ad.category_id} url={ad.permalink} />
      </DropDown>
    </DropDownMenuStyles>
  );
}
