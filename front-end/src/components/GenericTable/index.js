import React, { useState, useMemo } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import Loading from "react-loading";
import { Button, CardText, Col, Row, Table } from "reactstrap";

const GenericTable = React.memo(({ columns, data, renderExpandedRow, isLoading = false }) => {
  const [expandedRows, setExpandedRows] = useState([]);

  const handleExpandClick = index => {
    const currentIndex = expandedRows.indexOf(index);
    const newExpandedRows = [...expandedRows];

    if (currentIndex === -1) {
      newExpandedRows.push(index);
    } else {
      newExpandedRows.splice(currentIndex, 1);
    }

    setExpandedRows(newExpandedRows);
  };

  const expandAllRows = () => {
    const allRowIndexes = data.map((_, index) => index);
    setExpandedRows(allRowIndexes);
  };

  const closeAllRows = () => {
    setExpandedRows([]);
  };

  // Memoizing the LoadingComponent to avoid unnecessary re-renders
  const LoadingComponent = useMemo(() => {
    return (
      <Row style={{ justifyContent: "center", marginTop: "2rem" }}>
        <Col
          sm={{ size: "auto" }}
          md={{ size: "auto" }}
          lg={{ size: "auto" }}
          xs={{ size: "auto" }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 24, marginBottom: "2rem" }}>
            <strong>Isso pode demorar um pouco...</strong>
          </span>
          <Loading type="spinningBubbles" color="#054785" height={150} width={100} />
        </Col>
      </Row>
    );
  }, []);

  const TopButtonsComponent = () => {
    return (
      <div className="d-flex justify-content-between mb-2">
        <Button color="primary" onClick={expandAllRows}>
          <FaPlus className="mr-2" />
          Expandir Todas
        </Button>
        <Button color="secondary" onClick={closeAllRows}>
          <FaMinus className="mr-2" />
          Fechar Todas
        </Button>
      </div>
    );
  };

  return (
    <>
      {renderExpandedRow !== undefined && !isLoading ? <TopButtonsComponent /> : <></>}
      <Table className="table table-sm">
        {isLoading ? (
          LoadingComponent
        ) : (
          <>
            <thead className="thead-light">
              <tr>
                {columns.map((col, index) => (
                  <th key={index}>{col.label}</th>
                ))}
                {renderExpandedRow ? <th>Opções</th> : <></>}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <React.Fragment key={index}>
                  <tr
                    onClick={() => handleExpandClick(index)}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        style={{
                          position: "relative",
                        }}
                      >
                        {colIndex === 0 && (
                          <div
                            style={{
                              width: "5px",
                              height: "100%",
                              backgroundColor: !item.isValid ? "red" : "green",
                              position: "absolute",
                              left: 0,
                              top: 0,
                            }}
                          />
                        )}
                        <CardText
                          style={{
                            color: col.textColor ? col.textColor(item[col.datakey]) : "",
                            marginLeft: colIndex === 0 ? "8px" : 0,
                          }}
                        >
                          {col.mask ? col.mask(item[col.datakey]) : item[col.datakey]}
                        </CardText>
                      </td>
                    ))}

                    <td onClick={() => handleExpandClick(index)} style={{ textAlign: "center" }}>
                      {expandedRows.includes(index) ? <FaMinus /> : <FaPlus />}
                    </td>
                  </tr>
                  {expandedRows.includes(index) && (
                    <tr>
                      <td colSpan={columns.length + 1}>
                        <div style={{ paddingRight: 12, paddingLeft: 12, marginBottom: 12 }}>
                          {renderExpandedRow(item)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </>
        )}
      </Table>
    </>
  );
});

export default GenericTable;
