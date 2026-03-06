export default class advertPropertiesAnalyzer {
  constructor({ accounts, advertising, moduleRequiredByOperation }) {
    this.allowedAds = [];
    this.blockedAds = [];
    this.accounts = accounts;
    this.allAdvertsSelected = advertising.allChecked;
    this.downloadedAdverts = advertising.advertsArray;
    this.moduleRequiredByOperation = moduleRequiredByOperation;
  }
  getAccountPermissions({ accountId }) {
    const account = this.accounts.find((item) => item.id === accountId);
    const { modules_id } = account.permissions;
    const moduleIsSigned = modules_id
      ? modules_id.filter((id) => id === this.moduleRequiredByOperation).length
      : false;
    return moduleIsSigned;
  }
  updateBlockedAds({ advert }) {
    this.blockedAds = [...this.blockedAds, advert];
  }
  updateAllowedAds({ advert }) {
    this.allowedAds = [...this.allowedAds, advert];
  }
  saveAdvertsClassification(advertising) {
    for (const x in advertising) {
      if (advertising[x].subscriber) {
        this.updateAllowedAds({ advert: { ...advertising[x] } });
      } else this.updateBlockedAds({ advert: { ...advertising[x] } });
    }
  }
  classifyAdsByOwnerAccount() {
    if (!this.allAdvertsSelected) {
      const selectedAds = Object.values({
        ...this.downloadedAdverts,
      }).filter((advert) => advert.checked);
      const advertising = selectedAds.map((advert) => {
        const moduleIsSigned = this.getAccountPermissions({
          accountId: advert.account_id,
        });
        return {
          ...advert,
          subscriber: moduleIsSigned,
        };
      });
      this.saveAdvertsClassification(advertising);
      return true;
    }
    const selectedAds = Object.values({
      ...this.downloadedAdverts,
    }).filter((advert) => !advert.checked).map(advert => {
      return {
        ...advert,
        subscriber: true
      }
    });
    this.saveAdvertsClassification(selectedAds);
    return true;    
  }
  verification() {
    this.classifyAdsByOwnerAccount();
    return this.allAdvertsSelected
      ? true
      : this.allowedAds.length + this.blockedAds.length !== 0;
  }
}
