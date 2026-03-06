import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import fetchProcesses from "./fetchProcess";
import fetchProcessesDetails from "./fetchProcessDetails";
import Card from "reactstrap/lib/Card";
import CardHeader from "reactstrap/lib/CardHeader";
import CardBody from "reactstrap/lib/CardBody";
import LoadPageHandler from "../../../components/Loading";
import { saveProcessList, clearProcessList, saveProcessDetails } from "../../../redux/actions";
import Proccess from "./components/Proccess";
import ProcessItem from "./components/ProcessItem";
import ButtonComponent from "src/components/ButtonComponent";

const Processos = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProcessItem, setIsLoadingProcessItem] = useState({});
  const [accordion, setToggleAccordion] = useState({});
  const processList = useSelector(state => state.process.processList);
  const processItems = useSelector(state => state.process.processDetails);

  const updateProcessList = useCallback(() => {
    fetchProcesses({
      clearProcessList,
      dispatch,
      saveProcessList,
      setIsLoading,
    });
  }, [dispatch]);

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

  useEffect(() => {
    fetchProcesses({
      clearProcessList,
      dispatch,
      saveProcessList,
      setIsLoading,
    });
  }, [dispatch]);

  return (
    <div className="animated">
      <Card>
        <CardHeader style={{ display: "flex", justifyContent: "flex-end" }}>
          <ButtonComponent title="Atualizar" onClick={() => updateProcessList()} icon="cil-sync" />
        </CardHeader>
        <CardBody>
          <LoadPageHandler
            isLoading={isLoading}
            render={
              <>
                <div id="accordion">
                  {!processList.length ? (
                    <div className="alert alert-info fade show">Nenhum Processo encontrado!</div>
                  ) : (
                    processList.map((process, index) => {
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
    </div>
  );
};

export default Processos;
