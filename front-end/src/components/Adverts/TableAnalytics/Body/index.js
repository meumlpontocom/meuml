import React from "react";
import AdvertPrice from "./AdvertPrice";
import AdvertDescription from "./AdvertDescription";
import { useSelector } from "react-redux";
import SelectAdsRow from "../../Table/Body/SelectAdsRow";

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
          <tr style={{ backgroundColor: "#fff3f3" }} id="table-row" name="table-row" key={index}>
            <SelectAdsRow adID={advert.external_id} key={index} adIndex={index} status={advert.status} />
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
            <td>
              * Informar Tamanho <br />* Informar Cor
            </td>
            <AdvertPrice
              price={advert.price}
              originalPrice={advert.original_price}
              status={advert.status}
              soldQuantity={advert.sold_quantity}
              availableQuantity={advert.available_quantity}
              externalId={advert.external_id}
            />
          </tr>
        );
      })}
    </tbody>
  );
}

export default TableBody;
