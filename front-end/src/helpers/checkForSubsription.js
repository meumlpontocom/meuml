import axios from "axios";
import { getToken } from "../services/auth";

const checkForSubscription = async ({module}) => {
    try {
      const fetchUrl = `${process.env.REACT_APP_API_URL}/subscriptions/details`;
      const headers = { headers: { Authorization: `Bearer ${getToken()}` } };
      const {data: {message, data}} = await axios.get(fetchUrl, headers);
      let accounts_with_module_subscription = 0;
      switch (message) {
        case "Você ainda não possui assinatura":
          return false;
        default:
          for (const account in data) {
              if (data[account].modules.filter(x => x === module).length > 0) {
                accounts_with_module_subscription++;
              }
          }
          break;
      }
      return accounts_with_module_subscription !== 0;
    } catch (error) {
      return error;
    }
  };

export default checkForSubscription;
