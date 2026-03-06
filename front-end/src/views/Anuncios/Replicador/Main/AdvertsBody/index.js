import { useContext, useEffect, useMemo, useState } from "react";
import Loading from "react-loading";
import { useSelector } from "react-redux";
import { Col, Row } from "reactstrap";
import CardBody from "reactstrap/lib/CardBody";
import Table from "reactstrap/lib/Table";
import ButtonComponent from "src/components/ButtonComponent";
import LoadPageHandler from "../../../../../components/Loading";
import context from "../advertReplicationContext";
import AdvertAttributes from "./AdvertAttributes";
import AdvertDescription from "./AdvertDescription";
import AdvertDetails from "./AdvertDetails";
import AdvertSelect from "./AdvertSelect";
import AdvertThumb from "./AdvertThumb";
import EditBtn from "./EditBtn";

export default function AdvertsBody() {
  const { adverts, isLoading } = useContext(context);
  const { selectedAdverts } = useSelector(state => state.advertsReplication);
  const { selectAll, meta } = useSelector(state => state.advertsReplication);

  const amountSelected = useMemo(() => {
    return selectAll ? meta.total : selectedAdverts.length;
  }, [selectAll, meta.total, selectedAdverts.length]);

  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight) {
        setShowScrollTopButton(true);
      } else {
        setShowScrollTopButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {isLoading ? (
        <Row style={{ justifyContent: "center", marginTop: "100px" }}>
          <Col sm={{ size: "auto" }} md={{ size: "auto" }} lg={{ size: "auto" }} xs={{ size: "auto" }}>
            <Loading type="spinningBubbles" color="#054785" height={150} width={100} />
          </Col>
        </Row>
      ) : adverts.length ? (
        <CardBody>
          <LoadPageHandler
            isLoading={isLoading}
            render={
              <Table className="table table-responsive-sm">
                <tbody>
                  {adverts.length ? (
                    adverts.map(({ id }, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            <AdvertSelect id={id} />
                          </td>
                          <td>
                            <AdvertThumb id={id} />
                          </td>
                          <td>
                            <AdvertDetails id={id} />
                            <AdvertAttributes id={id} />
                            <AdvertDescription id={id} />
                          </td>
                          <td style={{ verticalAlign: "middle" }}>
                            <EditBtn id={id} />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </tbody>
              </Table>
            }
          />
        </CardBody>
      ) : (
        <></>
      )}
      {showScrollTopButton && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: amountSelected ? 240 : 16,
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <ButtonComponent
            variant=""
            color="secondary"
            onClick={scrollToTop}
            title="Ir ao topo"
            icon="cil-arrow-thick-to-top"
            height={45}
            width="100%"
          />
        </div>
      )}
      {amountSelected > 1 && (
        <div
          className="alert alert-dark"
          role="alert"
          style={{
            position: "fixed",
            bottom: 8,
            right: 16,
            zIndex: 999,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <strong>{amountSelected}</strong>{" "}
          {amountSelected > 1 ? "anúncios selecionados" : "anúncio selecionado"}
        </div>
      )}
    </>
  );
}
