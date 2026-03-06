import { useContext } from "react";
import SearchPublicInfoContext from "../SearchPublicInfo.context";

const Address = () => {
  const { searchResult } = useContext(SearchPublicInfoContext);

  if (searchResult.address.city) {
    const address = searchResult.address;
    return (
      <p>
        <strong className="text-info">Endereço:</strong>&nbsp;{address.city}
        {address.state ? ", " + address.state : ""}
      </p>
    );
  }
  return <></>;
};

export default Address;
