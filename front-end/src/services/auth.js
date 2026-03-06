export const TOKEN_KEY = "@MeuML-Token";
export const TOKEN_EXPIRE_IN = "@MeuML-Token-expire";
export const USER_ID = "@MeuML-UserId";
export const USER_NAME = "@MeuML-UserName";
export const USER_EMAIL = "@MeuML-UserEmail";
export const USER_SELLER_ID = "@MeuML-UserSellerId";
export const SYNC_ALL_LOG = "@MeuML-SyncAllLog";
export const SYNC_LOG = "@MeuML-SyncLog";
export const IS_ADMIN = "is_admin";
export const ROUTING = "@MeuML#location";

export const login = (token, expire, email, is_admin) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRE_IN, expire);
  localStorage.setItem(USER_EMAIL, email);
  if(is_admin === true){
    localStorage.setItem(IS_ADMIN, is_admin);
  }
};

export const logout = () => {
  try {
    localStorage.removeItem(USER_EMAIL);
    localStorage.removeItem(USER_NAME);
    localStorage.removeItem(USER_SELLER_ID);
    localStorage.removeItem(USER_ID);
    // localStorage.removeItem(SYNC_ALL_LOG);
    // localStorage.removeItem(SYNC_LOG);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRE_IN);
    localStorage.removeItem(IS_ADMIN);
    localStorage.removeItem(ROUTING);
    removeCategoriesFilter();
  } catch (error) {
    return error;
  }
};

function removeCategoriesFilter() {
  const categoriesFilter = JSON.stringify({
    page: 1,
    sortName: "id",
    sortOrder: "ASC",
    filter: "",
  });
  localStorage.setItem("filtro-categorias", categoriesFilter);
}

export const validateToken = () => {
  const newDate = new Date();
  const tokenDateExpire = new Date(getTokenExpire());

  return tokenDateExpire.getTime() >= newDate.getTime()
};

export const getTokenExpire = () => localStorage.getItem(TOKEN_EXPIRE_IN);
export const getToken = () => getFromStorageAndValidate(TOKEN_KEY);
export const getUserId = () => getFromStorageAndValidate(USER_ID);
export const getUserName = () => getFromStorageAndValidate(USER_NAME);
export const getUserEmail = () => getFromStorageAndValidate(USER_EMAIL);
export const getUserSellerId = () => getFromStorageAndValidate(USER_SELLER_ID);

function getFromStorageAndValidate(key) {
  if (validateToken()) {
    return localStorage.getItem(key);
  }
  logout();
  return {
    error: {
      message: "User has invalid token and must be kicked out from system.",
    },
  };
}
