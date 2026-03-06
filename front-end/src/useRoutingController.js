import { useMemo } from "react";
import routes      from "./routes";

const useRoutingController = () => {
  const isPrivateRoute = useMemo(() => {
     return routes.filter(route => route.path.match(window.location.hash.split("#/")[1]));
  }, []);
  return [isPrivateRoute];
}

export default useRoutingController;
