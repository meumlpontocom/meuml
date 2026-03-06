import React from "react";
import Main from "../../components/pages/Admin/Main";
import Loading from "../../components/Loading";
import AdminContainer, {
  Data,
} from "../../containers/data/admin/AdminContainer";
import { Provider } from "react-redux";
import store from "../../redux/store";

const Admin = () => (
  <Provider store={store}>
    <AdminContainer>
      <Data.Consumer>
        {(provider) => (
          <>
            {provider.renderRedirect()}
            <Loading isLoading={provider.state.isLoading} render={<Main />} />
          </>
        )}
      </Data.Consumer>
    </AdminContainer>
  </Provider>
);

export default Admin;
