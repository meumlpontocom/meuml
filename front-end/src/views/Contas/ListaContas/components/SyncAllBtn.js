import { CButton } from "@coreui/react";
import { useCallback } from "react";
import { FaSync } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setAccountsIsLoading } from "src/redux/actions";
import styled from "styled-components";
import Swal from "sweetalert2";
import { SynchronizeAllAccounts } from "../syncHandler";

const Button = styled(CButton)`
  height: 42px;
  min-width: 193px;
`;

const SyncAllBtn = () => {
  const dispatch = useDispatch();
  const { accounts } = useSelector(state => state.accounts);

  const setIsLoading = useCallback(boolean => dispatch(setAccountsIsLoading(boolean)), [dispatch]);

  const syncAll = useCallback(async () => {
    setIsLoading(true);
    const sync = new SynchronizeAllAccounts();
    const syncResult = await sync.handleSync();
    setIsLoading(false);
    await Swal.fire({
      html: `<p>${syncResult.message}</p>`,
      type: syncResult.status,
      showCloseButton: true,
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonText: "Fechar",
    });
  }, [setIsLoading]);

  return (
    <Button size="lg" color="success" onClick={syncAll} disabled={!Object.keys(accounts).length}>
      <FaSync className="mb-1" />
      &nbsp;Sincronizar Tudo
    </Button>
  );
};

export default SyncAllBtn;
