/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useContext } from "react";
import SearchPublicInfoContext from "../SearchPublicInfo.context";
import ButtonComponent from "src/components/ButtonComponent";

const VisitBtn = () => {
  const { isBtnBlock, searchResult } = useContext(SearchPublicInfoContext);

  const handleVisitBtnClick = useCallback(() => {
    window.open(searchResult.permalink, "blank");
  }, []);

  return (
    <ButtonComponent
      icon="cil-link"
      title="Visitar"
      className={isBtnBlock}
      onClick={handleVisitBtnClick}
      color="success"
    />
  );
};

export default VisitBtn;
