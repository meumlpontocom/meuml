import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import defaultAccountImage from "../../../assets/img/avatars/new_account.svg";
import CardImg from "reactstrap/lib/CardImg";

function AccountThumbnail({ id }) {
  const accountImg = useSelector(({ accounts }) => {
    const account = accounts.accounts[id];
    if (account) {
      switch (account.platform) {
        case "SP":
          return account.images && account.images !== "{}"
            ? account.images[0]
            : defaultAccountImage;

        default:
          return (
            account.external_data?.thumbnail?.picture_url || defaultAccountImage
          );
      }
    }

    return defaultAccountImage;
  });
  return (
    <CardImg
      src={accountImg}
      className="img-account rounded img-responsive"
      alt="Imagem de conta padrão"
    />
  );
}

AccountThumbnail.propTypes = {
  id: PropTypes.string,
};

export default AccountThumbnail;
