import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import fetchReplicationHistory from "./fetchReplicationHistory";
import Card from "reactstrap/lib/Card";
import CardHeader from "reactstrap/lib/CardHeader";
import CardBody from "reactstrap/lib/CardBody";
import LoadPageHandler from "../../../components/Loading";
import { saveProcessDetails } from "../../../redux/actions";
import Proccess from "./components/Proccess";
import ProcessItem from "./components/ProcessItem";
import ButtonComponent from "src/components/ButtonComponent";
import { useHistory, useLocation } from "react-router";
import Swal from "sweetalert2";
import fetchProcessesDetails from "src/views/Processos/Main/fetchProcessDetails";
import Pagination from "react-js-pagination";

const ReplicationsHistory = () => {
  const history = useHistory();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const page = Number(searchParams.get("page") ?? "1");

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProcessItem, setIsLoadingProcessItem] = useState({});
  const [accordion, setToggleAccordion] = useState({});
  const [replications, setReplications] = useState([]);
  const [meta, setMeta] = useState({ page });
  const processItems = useSelector(state => state.process.processDetails);

  const fetchProcessItems = useCallback(
    processId => {
      fetchProcessesDetails({
        isLoadingProcessItem,
        setIsLoadingProcessItem,
        dispatch,
        saveProcessDetails,
        processId,
      });
    },
    [dispatch, isLoadingProcessItem],
  );

  const handleHeaderClick = useCallback(
    ({ processId }) => {
      setToggleAccordion({
        ...accordion,
        [processId]: !accordion[processId],
      });
      if (!accordion[processId] === true && !processItems[processId]) fetchProcessItems(processId);
    },
    [accordion, fetchProcessItems, processItems],
  );

  function setPageParam(newPage) {
    searchParams.set("page", newPage);
    history.replace({ search: searchParams.toString() });
  }

  const handleListReplications = useCallback(async () => {
    try {
      setIsLoading(true);

      const { replications, meta } = await fetchReplicationHistory(page);

      setReplications(replications);
      setMeta(meta);
    } catch (error) {
      Swal.fire({
        title: "Erro",
        html: `<p>${error.message}</p>`,
        showCloseButton: true,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    handleListReplications();
  }, [handleListReplications]);

  return (
    <div className="animated">
      <Card>
        <CardHeader style={{ display: "flex", justifyContent: "flex-end" }}>
          <ButtonComponent title="Atualizar" onClick={handleListReplications} icon="cil-sync" />
        </CardHeader>
        <CardBody>
          <LoadPageHandler
            isLoading={isLoading}
            render={
              <>
                <div id="accordion">
                  {!replications.length ? (
                    <div className="alert alert-info fade show">Nenhum Processo encontrado!</div>
                  ) : (
                    replications.map((process, index) => {
                      return (
                        <Card className="mb-0 listaProcessos " key={process.process_id}>
                          <Proccess
                            handleClick={handleHeaderClick}
                            process={process}
                            accordion={accordion}
                            index={index}
                          />
                          <ProcessItem
                            isLoadingProcessItem={isLoadingProcessItem}
                            processItems={processItems}
                            process={process}
                            accordion={accordion}
                            index={index}
                          />
                        </Card>
                      );
                    })
                  )}
                </div>
              </>
            }
          />
        </CardBody>
      </Card>

      <Pagination
        onChange={setPageParam}
        itemsCountPerPage={meta?.limit ?? 50}
        totalItemsCount={meta?.total ?? 0}
        activePage={page}
        pageRangeDisplayed={5}
        innerClass="btn-group"
        activeLinkClass="text-white"
        activeClass="btn btn-md btn-info"
        itemClass="btn btn-md btn-outline-info"
      />
    </div>
  );
};

export default ReplicationsHistory;
