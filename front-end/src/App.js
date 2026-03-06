import "./scss/style.scss";
import { Suspense } from "react";
import Loadable from "react-loadable";
import { HashRouter, Redirect, Route, Switch } from "react-router-dom";
import useAuthentication from "./useAuthentication";
import ErrorBoundary from "./components/ErrorBoundary";
import ApplicationError from "./components/ApplicationError";

const loading = () => (
  <div className="animated fadeIn pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

const DefaultLayout = Loadable({
  loader: () => import("./containers/TheLayout"),
  loading,
});

const Login = Loadable({
  loader: () => import("./views/Autenticacao/Login"),
  loading,
});

const Logout = Loadable({
  loader: () => import("./views/Autenticacao/Logout"),
  loading,
});

const Register = Loadable({
  loader: () => import("./views/Autenticacao/Cadastro"),
  loading,
});

const RegisterConfirm = Loadable({
  loader: () => import("./views/Autenticacao/ConfirmarCadastro"),
  loading,
});

const PasswordRecovery = Loadable({
  loader: () => import("./views/Autenticacao/PasswordRecovery"),
  loading,
});

const UpdatePassword = Loadable({
  loader: () => import("./views/Autenticacao/UpdatePassword"),
  loading,
});

const Main = ({ isAuthenticated }) =>
  isAuthenticated ? (
    <ErrorBoundary render={<ApplicationError />}>
      <DefaultLayout />
    </ErrorBoundary>
  ) : (
    <Redirect to="/entrar" />
  );

export default function App() {
  const [isAuthenticated] = useAuthentication();

  return isAuthenticated ? (
    <HashRouter>
      <Suspense fallback={loading}>
        <Switch>
          <Route
            path="/"
            name="MeuML.com"
            component={() => <Main isAuthenticated={isAuthenticated} />}
            exact={!isAuthenticated}
          />
        </Switch>
      </Suspense>
    </HashRouter>
  ) : (
    <HashRouter>
      <Suspense fallback={loading}>
        <Switch>
          <Route
            path="/entrar"
            name="Entrar"
            component={props => <Login isAuthenticated={isAuthenticated} {...props} />}
            exact
          />
          <Route path="/logout" name="Logout" component={Logout} />
          <Route path="/cadastro" name="Cadastro" component={Register} exact />
          <Route
            path="/confirmar-cadastro/:email"
            name="Confirmar Cadastro"
            component={RegisterConfirm}
            exact
          />
          <Route path="/recuperar-senha" name="Recuperar Senha" component={PasswordRecovery} exact />
          <Route path="/recuperar-senha/:email" name="Alterar Senha" component={UpdatePassword} exact />
          <Route path="*" name="404" component={() => <Redirect to="/entrar" />} />
        </Switch>
      </Suspense>
    </HashRouter>
  );
}
