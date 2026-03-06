import React                     from "react";
import Table                     from "./Table";
import { useSelector }           from "react-redux";
import { CRow, CCol, CCardBody } from "@coreui/react";
import Title                     from "./advert/Title";
import Price                     from "./advert/Price";
import ModerationDate            from "./ModerationDate";
import Thumbnail                 from "./advert/Thumbnail";
import AdvertOptionsBtn          from "./AdvertOptionsBtn";
import Boosts                    from "./priceToWin/Boosts";
import AccountName               from "./advert/AccountName";
import SelectAdvert              from "./advert/SelectAdvert";
import CatalogStatus             from "./priceToWin/CatalogStatus";
import PriceToWinSection         from "./priceToWin/PriceToWinSection";
import AdvertStatusBadge         from "../../../../components/Adverts/Table/Body/AdvertStatusBadge";
import { BestPrice }             from "../../../../components/Adverts/Table/Body/AdvertDescription/_components";
import AdvertCategory            from "../../../../components/Adverts/Table/Body/AdvertDescription/AdvertCategory";
import CatalogOptions            from "../../../../components/Adverts/Table/Body/AdvertDescription/CatalogOptions";

export default function Body({ history }) {
  const { accounts } = useSelector((state) => state.accounts);
  const { advertising } = useSelector((state) => state.catalog);

  const getAccountPermissions = (id) => {
    const account = Object.values(accounts)?.filter(
      (account) => account.id === id
    )[0];
    return account?.permissions;
  };

  const isCatalogEligible = ({ listing_type, condition, tags }) => {
    return (
      (listing_type === "gold_pro" && condition === "new") ||
      tags.filter((tag) => tag === "catalog_listing_eligible").length
    );
  };

  return (
    <CCardBody>
      <Table>
        {Object.values(advertising).length ? (
          Object.values(advertising).map((advert, index) => {
            return (
              <tr id="table-row" key={index}>
                <AdvertStatusBadge status={advert.status} />
                <SelectAdvert id={advert.external_id} />
                <Thumbnail secureThumbnail={advert.secure_thumbnail} />
                <td>
                  <CRow>
                    <CCol sm="12" md="12" lg="12" xs="12">
                      <Title
                        externalId={advert.external_id}
                        permalink={advert.permalink}
                        title={advert.title}
                      />
                      <p>
                        <AccountName externalName={advert.external_name} />
                        <Price price={advert.price} />
                        <CatalogOptions
                          price={advert.price}
                          title={advert.title}
                          advertID={advert.id}
                          externalData={advert.external_data}
                        />
                        <AdvertCategory
                          itemRelations={advert.external_data.item_relations}
                          advertIsEligible={isCatalogEligible(advert)}
                          catalogProductName={
                            advert.external_data.catalog_product_name
                          }
                          advertCatalogListing={isCatalogEligible(advert)}
                        />
                        <ModerationDate id={advert.id} moderationDate={advert.moderation_date} />
                        <CatalogStatus value={advert.pw_status_ptbr} />
                        <PriceToWinSection
                          catalogListing={advert.external_data.catalog_listing}
                          competitorsSharingFirstPlace={advert.pw_competitors_sharing_first_place}
                          winnerPrice={advert.pw_winner_price}
                          currentPrice={advert.pw_current_price}
                          priceToWin={advert.pw_price_to_win}
                        />
                        {advert.status !== "closed" &&
                          <BestPrice
                            advertId={advert.external_id}
                            accountId={advert.account_id}
                            catalogListing={advert.external_data.catalog_listing}
                          />
                        }
                        <Boosts
                          advertId={advert.id}
                          selfBoosts={advert.pw_boosts}
                          winnerBoosts={advert.pw_winner_boosts}
                          winnerPrice={advert.pw_winner_price}
                          currentPrice={advert.pw_current_price}
                          priceToWin={advert.pw_price_to_win}
                        />
                      </p>
                    </CCol>
                  </CRow>
                </td>
                <AdvertOptionsBtn
                  history={history}
                  ad={advert}
                  advertId={advert.id}
                  permissions={getAccountPermissions(advert.account_id)}
                  itemRelations={advert.external_data.item_relations}
                  catalogListing={isCatalogEligible(advert)}
                  advertExternalId={advert.external_id}
                />
              </tr>
            );
          })
        ) : (
          <h5>Nenhum anúncio encontrado.</h5>
        )}
      </Table>
    </CCardBody >
  );
}
