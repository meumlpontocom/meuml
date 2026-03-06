/* eslint-disable no-extend-native */
import axios from "axios";
import { isUndefined, isNull } from "util";
import timeConstructor from "../../../services/timeHandler";
import { SYNC_ALL_LOG, SYNC_LOG, getToken } from "../../../services/auth";

// Changed Date prototype in this file to work with the correct timezone.
Date.prototype.toJSON = function () {
  var timezoneOffsetInHours = -(this.getTimezoneOffset() / 60);
  var sign = timezoneOffsetInHours >= 0 ? "+" : "-";
  var leadingZero = Math.abs(timezoneOffsetInHours) < 10 ? "0" : "";

  var correctedDate = new Date(
    this.getFullYear(),
    this.getMonth(),
    this.getDate(),
    this.getHours(),
    this.getMinutes(),
    this.getSeconds(),
    this.getMilliseconds(),
  );
  correctedDate.setHours(this.getHours() + timezoneOffsetInHours);
  var iso = correctedDate.toISOString().replace("Z", "");

  return iso + sign + leadingZero + Math.abs(timezoneOffsetInHours).toString() + ":00";
};

export class SynchronizeAllAccounts {
  constructor() {
    this.timeNow = null;
    this.lastGeneralSync = new Date(localStorage.getItem(SYNC_ALL_LOG));
  }

  dateNow = async () => await timeConstructor(Date.now("GMT-3"));

  async handleSync() {
    try {
      this.timeNow = await this.dateNow();
      const canCallApi = await this.syncAllFeasibility();
      if (canCallApi) {
        return await axios
          .get(process.env.REACT_APP_API_URL + "/accounts/sync/all", {
            headers: { Authorization: `Bearer ${getToken()}` },
          })
          .then(response => {
            this.setNewLogAtLocalStorage();
            return {
              message: response.data.message,
              status: response.data.status,
            };
          })
          .catch(error => error);
      } else
        return {
          message:
            'Acompanhe a sincronização em <a href="/#/processos">Processos</a>. Espere 4 horas para sincronizar novamente.',
          status: "warning",
        };
    } catch (error) {
      return error;
    }
  }

  async syncAllFeasibility() {
    const userHasSyncAllLog = !this.lastGeneralSync;
    if (userHasSyncAllLog) {
      const lastSyncAll = await timeConstructor(this.lastGeneralSync);
      return this.dateComparision(lastSyncAll);
    } else return true;
  }

  dateComparision(lastSyncAll) {
    const daysAreEqual = Number(lastSyncAll.dia) === Number(this.timeNow.dia);
    const hoursAreEqual = Number(lastSyncAll.horas) === Number(this.timeNow.horas);

    if (daysAreEqual) {
      if (hoursAreEqual) return false;
      else if (Number(this.timeNow.horas) - Number(lastSyncAll.horas) >= 4) return true;
      else return false;
    } else return true;
  }

  setNewLogAtLocalStorage() {
    localStorage.setItem(SYNC_ALL_LOG, new Date(Date.now("GMT-3")));
  }
}

export class SynchronizeAccount {
  constructor(id, platform) {
    this.id = id;
    this.platform = platform;
    this.timeNow = null;
    this.synchronizedAccounts = JSON.parse(localStorage.getItem(SYNC_LOG));
  }
  dateNow = async () => await timeConstructor(Date.now("GMT-3"));

  async handleSync() {
    try {
      this.takeCareOfDataType();
      this.timeNow = await this.dateNow();
      const canCallApi = await this.syncFeasibility();
      if (canCallApi) {
        if (this.platform === "SP") {
          return await axios
            .get(process.env.REACT_APP_API_URL + `/accounts/${this.id}/sync/sp`, {
              headers: { Authorization: `Bearer ${getToken()}` },
            })
            .then(response => {
              this.setNewLogAtLocalStorage();
              return {
                message: response.data.message,
                status: response.data.status,
              };
            })
            .catch(error => ({
              message: error?.response?.data?.message || error?.message || error,
              status: "error",
            }));
        } else {
          return await axios
            .get(process.env.REACT_APP_API_URL + `/accounts/${this.id}/sync`, {
              headers: { Authorization: `Bearer ${getToken()}` },
            })
            .then(response => {
              this.setNewLogAtLocalStorage();
              return {
                message: response.data.message,
                status: response.data.status,
              };
            })
            .catch(error => ({
              message: error.response?.data?.message || error?.message || error,
              status: "error",
            }));
        }
      } else {
        return {
          message:
            'Acompanhe a sincronização em <a href="/#/processos">Processos</a>. Espere 4 horas para sincronizar novamente.',
          status: "warning",
        };
      }
    } catch (error) {
      return error;
    }
  }

  async syncFeasibility() {
    const lastSync = await this.handleAccountsList();
    if (isUndefined(lastSync)) return true;
    else return this.dateComparision(lastSync);
  }

  async handleAccountsList() {
    try {
      const accountSyncLog = await this.synchronizedAccounts.filter(account => account.id === this.id);
      if (accountSyncLog !== null && accountSyncLog !== undefined) {
        return await timeConstructor(accountSyncLog[0].lastSync);
      } else return undefined;
    } catch (error) {
      if (error.message === "Cannot read property 'status' of undefined") return true;
    }
  }

  dateComparision(lastSync) {
    const daysAreEqual = Number(lastSync.dia) === Number(this.timeNow.dia);
    const hoursAreEqual = Number(lastSync.horas) === Number(this.timeNow.horas);
    if (daysAreEqual) {
      if (hoursAreEqual) return false;
      else if (Number(this.timeNow.horas) - Number(lastSync.horas) >= 4) return true;
      else return false;
    } else return true;
  }

  takeCareOfDataType() {
    if (Array.isArray(this.synchronizedAccounts)) return true;
    else {
      this.synchronizedAccounts = new Array(this.synchronizedAccounts);
      return true;
    }
  }

  async setNewLogAtLocalStorage() {
    if (
      this.synchronizedAccounts[0] !== null &&
      this.synchronizedAccounts[0] !== undefined &&
      this.synchronizedAccounts.length > 0
    ) {
      let accountArray = await this.synchronizedAccounts.filter(account => account.id !== this.id);
      const lastSync = new Date();
      const accountLog = { id: this.id, lastSync: lastSync };
      accountArray.push(accountLog);
      const stringified = JSON.stringify(accountArray);
      localStorage.setItem(SYNC_LOG, stringified);
    } else {
      const lastSync = new Date(Date.now("GMT-3"));
      const accountArray = new Array(JSON.stringify({ id: this.id, lastSync: lastSync }));
      localStorage.setItem(SYNC_LOG, accountArray);
    }
  }
}
