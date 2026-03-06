import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdverts } from "./requests";
import Card from "reactstrap/lib/Card";
import Header from "./Header";
import Body from "./Body";
import Footer from "./Footer";
import LoadPageHandler from "../../../../components/Loading";

export default function Main({ history }) {
  const dispatch = useDispatch();
  const {
    loading,
    meta: { first_page },
  } = useSelector(state => state.catalog);

  useEffect(() => {
    getAdverts({ dispatch, page: first_page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <Header />
      <LoadPageHandler
        isLoading={loading}
        render={
          <>
            <Body history={history} />
            <Footer />
          </>
        }
      />
    </Card>
  );
}
