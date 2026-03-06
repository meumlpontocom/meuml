export default function getListingTypes(listingType) {
  const listing_types = [
    {
      "id": "gold_pro",
      "name": "Premium"
    },
    {
      "id": "gold_premium",
      "name": "Diamante"
    },
    {
      "id": "gold_special",
      "name": "Clássico"
    },
    {
      "id": "gold",
      "name": "Ouro"
    },
    {
      "id": "silver",
      "name": "Prata"
    },
    {
      "id": "bronze",
      "name": "Bronze"
    },
    {
      "id": "free",
      "name": "Grátis"
    }
  ];
  
  return listingType === "return_all_types" 
    ? listing_types
    : listing_types
      .filter(type => type.id === listingType)[0]?.name;
}