import React from "react";
import AdvertImage from "./AdvertImage";
import AdvertPrice from "./AdvertPrice";
import MenuSection from "./MenuSection";
import SelectAdsRow from "./SelectAdsRow";
import AdvertStatusBadge from "./AdvertStatusBadge";
import AdvertDescription from "./AdvertDescription";
import { useSelector } from "react-redux";
import Tags from "./Tags";

function TableBody({ adverts }) {
  const accounts = useSelector(state =>
    Object.values(state.accounts.accounts).map(item => ({
      id: item.id,
      permissions: item.permissions,
    })),
  );

  return (
    <tbody id="table-body" name="table-body">
      {adverts.map((advert, index) => {
        return (
          <tr id="table-row" name="table-row" key={index}>
            <AdvertStatusBadge status={advert.status} />
            <SelectAdsRow
              adID={advert.external_id}
              key={index}
              adIndex={index}
              status={advert.status}
              title={advert.title}
              price={advert.price}
              advertData={advert}
            />
            <AdvertImage src={advert.external_data.secure_thumbnail} />
            <AdvertDescription
              promotions={advert.promotions}
              description={advert.description}
              advertLink={advert.permalink}
              title={advert.title}
              ownerAccountName={advert.external_name}
              id={advert.external_id}
              condition={advert.condition}
              listing={advert.listing_type}
              shipping={advert.free_shipping}
              shippingTags={advert.shipping_tags}
              tags={advert.external_data.tags || []}
              externalData={advert.external_data}
              price={advert.price}
              originalPrice={advert.original_price}
              accountId={advert.account_id}
              dateCreated={advert.date_created}
              dateLastModified={advert.date_modified}
              permissions={accounts.find(item => item.id === advert.account_id)}
            />
            <Tags advertiseId={advert.external_id} tags={advert.meuml_tags} />
            <AdvertPrice
              price={advert.price}
              originalPrice={advert.original_price}
              status={advert.status}
              soldQuantity={advert.sold_quantity}
              availableQuantity={advert.available_quantity}
              externalId={advert.external_id}
            />
            <MenuSection
              advert={advert}
              status={advert.status}
              permissions={accounts.find(item => item.id === advert.account_id)}
            />
          </tr>
        );
      })}
    </tbody>
  );
}

export default TableBody;
