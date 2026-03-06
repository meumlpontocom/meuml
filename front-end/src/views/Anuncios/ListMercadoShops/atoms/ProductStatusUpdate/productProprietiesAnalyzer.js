export default class productProprietiesAnalyzer {
    constructor({ accounts, products, moduleRequiredByOperation, allProductsSelected }) {
      this.allowedProduct = [];
      this.blockedProducts = [];
      this.accounts = accounts;
      this.allProductsSelected = allProductsSelected;
      this.downloadedProducts = products;
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
    updateBlockedProducts({ product }) {
      this.blockedProducts = [...this.blockedProducts, product];
    }
    updateAllowedProduct({ product }) {
      this.allowedProduct = [...this.allowedProduct, product];
    }
    saveProductClassification(products) {
      for (const x in products) {
        if (products[x].subscriber) {
          this.updateAllowedProduct({ product: { ...products[x] } });
        } else this.updateBlockedProducts({ product: { ...products[x] } });
      }
    }
    classifyProductByOwnerAccount() {
      if (!this.allProductsSelected) {
        const selectedProducts = Object.values({
          ...this.downloadedProducts,
        }).filter((product) => product.selected);
        const products = selectedProducts.map((product) => {
          const moduleIsSigned = this.getAccountPermissions({
            accountId: product.account_id,
          });
          return {
            ...product,
            subscriber: moduleIsSigned,
          };
        });
        this.saveProductClassification(products);
        return true;
      }
      const selectedProducts = Object.values({
        ...this.downloadedProducts,
      }).filter((product) => !product.selected).map(product => {
        return {
          ...product,
          subscriber: true
        }
      });
      this.saveProductClassification(selectedProducts);
      return true;    
    }
    verification() {
      this.classifyProductByOwnerAccount();
      return this.allProductsSelected
        ? true
        : this.allowedProduct.length + this.blockedProducts.length !== 0;
    }
  }
  