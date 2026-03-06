import React                                  from "react";
import { Collapse, ListGroup, ListGroupItem } from "reactstrap";
import { CCardBody }                          from "@coreui/react";
import StatusColor                            from "../StatusColor";
import MessageRenderingHandler                from "./MessageRenderingHandler";
import LoadingCardData                        from "src/components/LoadingCardData";

const ProcessItem = ({ process, accordion, index, isLoadingProcessItem, processItems }) => {
  return (
    <Collapse
      isOpen={accordion[process.process_id]}
      data-parent="#accordion"
      id={"collapse" + index}
      aria-labelledby={"heading" + index}
    >
      <CCardBody className="subItensProcessos">
        {isLoadingProcessItem[process.process_id] ? (
          <LoadingCardData />
        ) : (
          <ListGroup className="listaSubItem">
            {processItems[process.process_id] ? (
              processItems[process.process_id].map((processItem, index) => {
                return (
                  <ListGroupItem key={index}>
                    <StatusColor status={processItem.status} />
                    <MessageRenderingHandler message={processItem.message} />
                  </ListGroupItem>
                );
              })
            ) : (
              <p className="text-muted text-center">
                Não foi possível obter dados sobre este processo. Por favor, tente novamente.
              </p>
            )}
          </ListGroup>
        )}
      </CCardBody>
    </Collapse>
  );
};

export default ProcessItem;
