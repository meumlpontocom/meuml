import { useContext } from "react";
import SearchPublicInfoContext from "../SearchPublicInfo.context";

const Id = () => {
  const { searchResult } = useContext(SearchPublicInfoContext);
  if (searchResult.id)
    return (
      <p>
        <strong className="text-info">ID:</strong>&nbsp;{searchResult.id}
      </p>
    );
  return <></>;
};

export default Id;
