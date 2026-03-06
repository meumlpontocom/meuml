import api from "src/services/api";
import { getToken } from "src/services/auth";
import { SynchronizeAccount } from "src/views/Contas/ListaContas/syncHandler";
import Swal from "sweetalert2";
import { saveAccounts, setAccountsIsLoading } from "../../../../redux/actions";

export async function syncAccount({ dispatch, account_id, index, platform, syncState }) {
  dispatch(setAccountsIsLoading(true));
  const sync = new SynchronizeAccount(account_id, platform);
  const syncResult = await sync.handleSync();
  if (syncResult.status === "warning") {
    let accountList = syncState.accountSyncList;
    accountList[index] = true;
    syncState.setAccountSyncList({ disableSync: accountList });
  }
  dispatch(setAccountsIsLoading(false));
  return Swal.fire({
    html: `<p>${syncResult.message}</p>`,
    type: syncResult.status,
    showCloseButton: true,
  });
}

export function deleteAccount({ dispatch, account_id, platform }) {
  dispatch(setAccountsIsLoading(true));
  Swal.fire({
    title: "Atenção",
    text: "Você tem certeza que deseja remover a conta?",
    type: "warning",
    showCloseButton: true,
    showConfirmButton: true,
    showCancelButton: true,
    cancelButtonText: "Cancelar",
  }).then(async user => {
    if (user.value) {
      const url =
        platform === "SP" ? `/shopee/remove_account?account_id=${account_id}` : `/accounts/${account_id}`;
      await api
        .delete(url, {
          headers: { Authorization: "Bearer " + getToken() },
        })
        .then(response => {
          Swal.fire({
            html: `<p>${response.data.message}</p>`,
            type: response.data.status,
            showConfirmButton: true,
          });
          fetchAccounts(dispatch);
        })
        .catch(error => {
          Swal.fire({
            html: `<p>${
              error.response ? error.response.data.message : error.message ? error.message : error
            }</p>`,
            type: "error",
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: "Fechar",
            onClose: () => window.location.reload(),
          });
        });
    }
  });

  dispatch(setAccountsIsLoading(false));
}

export function renameAccount({ dispatch, account_id, platform }) {
  const handleResponse = (response, result) => {
    if (response.data.status === "success") {
      Swal.fire({
        title: "Sucesso",
        text: response.data.message,
        type: "success",
        showCloseButton: true,
        showConfirmButton: true,
      }).then(() => {
        if (platform !== "SP") {
          document.querySelector(`#account-name-${account_id}`).innerHTML = result.value;
        }
        fetchAccounts(dispatch);
      });
    } else {
      Swal.fire({
        html: `<p>${response.data.message}</p>`,
        type: "error",
        showConfirmButton: true,
        showCloseButton: true,
      });
    }
  };

  const handleError = error => {
    Swal.fire({
      html: `<p>${error.response ? error.response.data.message : error.message ? error.message : error}</p>`,
      type: "error",
      showConfirmButton: true,
      showCloseButton: true,
    });
  };

  const rename = (url, result) => {
    dispatch(setAccountsIsLoading(true));
    api
      .put(url, { name: result.value }, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(response => handleResponse(response, result))
      .catch(handleError)
      .finally(() => dispatch(setAccountsIsLoading(false)));
  };

  Swal.fire({
    type: "question",
    title: "Renomear Conta:",
    input: "text",
    inputAttributes: {
      maxLength: 50,
      id: "new-account-name-input"
    },
    inputAutoTrim: true,
    showCancelButton: true,
    inputPlaceholder: "Preencha o novo nome",
    html: "<div> Máximo 50 caracteres: <span id='new-account-name-counter'>0</span>/50 </div>",
    padding: '20px',
    onOpen: () => {
      const inputElement = document.getElementById("new-account-name-input");
      const inputCounter = document.getElementById("new-account-name-counter");

      inputElement.addEventListener("input", (e) => {
        const inputText = e.target.value ?? "";
        const characterCounter = inputText.length;
        inputCounter.innerText = characterCounter;

        const degreeOfFullness = characterCounter === 50 ? '#f00' : characterCounter >= 40 ? '#dd6902' : '#545454';

        inputCounter.style.color = degreeOfFullness;
      });
    },
  }).then(result => {
    if (result.value) {
      const url = platform === "SP" ? `/accounts/${account_id}/sp` : `/accounts/${account_id}`;
      rename(url, result);
    }
  });
}

async function fetchAccounts(dispatch) {
  const showError = error => {
    Swal.fire({
      title: "Erro ao atualizar lista de contas!",
      texto: error,
      type: "error",
      showCloseButton: true,
    });
  };
  await api
    .get("/accounts", { headers: { Authorization: `Bearer ${getToken()}` } })
    .then(_response => {
      if (_response.data.status === "success") {
        dispatch(saveAccounts(_response.data.data));
      } else {
        showError(_response.data.message);
      }
    })
    .catch(error => showError(error?.response?.data?.message || error?.message || error));
}
