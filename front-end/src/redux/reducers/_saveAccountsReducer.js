import { SAVE_USER_ACCOUNTS } from '../actions/action-types';

const INITIAL_STATE = [
  {
    "date_created": "Wed, 14 Aug 2019 20:47:15 GMT",
    "date_modified": "Wed, 14 Aug 2019 20:47:15 GMT",
    "external_data": {},
    "external_email": "mail@anon.com",
    "external_name": "EXTERNAL_NAME",
    "external_nickname": "NICKNAME",
    "external_permalink": "http://perfil.mercadolivre.com.br/",
    "id": 0,
    "name": "Carregando ...",
    "status": 1,
    "total_advertisings": 0,
    "total_orders": 0,
    "user_id": 0
  }
]

export default function _saveAccountsReucer(state = [], action) {
  if (state.length === 0) {
    return INITIAL_STATE;
  }

  if (action.type === SAVE_USER_ACCOUNTS) {
    const udpatedData = { ...state, ...action.payload };
    return udpatedData;
  }

  return state;
}