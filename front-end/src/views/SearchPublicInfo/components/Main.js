import { useContext } from "react";
import PageHeader from "src/components/PageHeader";
import SearchPublicInfoContext from "../SearchPublicInfo.context";
import Search from "./Search";

const Main = () => {
  const { viewName } = useContext(SearchPublicInfoContext);
  return (
    <>
      <PageHeader heading={viewName} subheading="Mercado Livre" />
      <Search />
    </>
  );
};

export default Main;
