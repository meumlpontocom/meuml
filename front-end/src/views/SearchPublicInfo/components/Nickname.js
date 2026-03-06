import { useContext } from "react";
import SearchPublicInfoContext from "../SearchPublicInfo.context";

const Nickname = () => {
  const { searchResult } = useContext(SearchPublicInfoContext);

  if (searchResult.nickname) {
    return (
      <p>
        <strong className="text-info">Apelido:</strong>&nbsp;{searchResult.nickname}
      </p>
    );
  }
  return <></>;
};

export default Nickname;
