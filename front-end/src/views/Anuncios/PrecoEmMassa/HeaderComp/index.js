import React from "react";
import {Container} from "./styles";
import {useSelector} from "react-redux";

export const howManySelected = (selectedAds, total) => {
  const sumTotal = Object.values(selectedAds.advertsArray).filter((item) => !item.checked);
  if (selectedAds.allChecked === true) return `${total - sumTotal.length} anúncios selecionados`;
  else {
    const advertsArray = selectedAds.advertsArray;
    let selectedLength = 0;
    for (const key in advertsArray) {
      if (advertsArray[key].checked === true) selectedLength = selectedLength += 1;
    }
    if (selectedLength > 0) return `${selectedLength} anúncios selecionados`;
    else return "Nenhum anúncio selecionado.";
  }
};

export default function SelectedAdsAmount({/*openModal,*/justifyContent}) {
  const selectedAds = useSelector((state) => state.selectedAdverts);
  const {total} = useSelector((state) => state.advertsMeta);

  const accounts = useSelector((state) => {
    const accountComp = []
    Object.values(state.accounts.accounts).forEach((account) => {
      if (account.permissions) {
        accountComp.push({
          name: account.name,
          id: account.id,
          permission: account.permissions.modules_id && account.permissions.modules_id.find((i) => i === 6),
        });
      }
    });
    const newArr = [];

    Object.values(state.selectedAdverts.advertsArray)
      .map((acc) => accountComp.filter((account) => account.id === acc.account_id && acc.checked))
      .map((item) => item[0])
      .filter((item) => item !== undefined)
      .map((item) => {
        newArr.indexOf(item) === -1 && newArr.push(item);
        return item;
      });
    return newArr;
  });

  // const noPermission = useMemo(() => {
  //   return accounts.filter((item) => item.permission !== true).map((item) => item.name);
  // }, [accounts]);

  return (
    <>
      <div className={`accounts row col-12 justify-content-${justifyContent || "center"}`}>
        <p>Contas envolvidas:</p>
        <div>
          {!!accounts.length > 0 ? (
            accounts.map((account) => (
              <p key={account.id}>
                <b>{account.name}</b>
              </p>
            ))
          ) : selectedAds.allChecked ? (
            <p>Todas as contas foram selecionadas.</p>
          ) : (
            <></>
          )}
        </div>
      </div>

      <div className={`row col-12 justify-content-${justifyContent || "center"} mt-2`}>
        <Container>
          <h5>
            <span className="badge badge-success">
              Anúncios selecionados:
              <span className="badge badge-secondary ml-1">{howManySelected(selectedAds, total)}</span>
            </span>
          </h5>
        </Container>
      </div>
    </>
  );
}
