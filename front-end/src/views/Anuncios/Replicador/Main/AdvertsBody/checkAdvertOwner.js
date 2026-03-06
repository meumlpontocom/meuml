export default function checkAdvertOwner({ id, seller_id, accounts, is_owner }) {
  if (is_owner && seller_id && accounts) {
    const ownerAccount = Object.values(accounts).filter((account) => account.id === seller_id);
    return ownerAccount?.length
      ? `Anúncio pertence à conta ${ownerAccount[0].name}`
      : id;
  }
  return String(id);
}
