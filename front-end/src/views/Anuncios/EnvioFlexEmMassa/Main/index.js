import React, {useState, useEffect, useMemo} from "react";
import {useSelector} from "react-redux";
import {
  Container,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Col,
  Row,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
import ModalNoPermission from "../../../../components/ModalNoPermission";
import SelectedAdsAmount from "../../PrecoEmMassa/HeaderComp";
import LoadPageHandler from "../../../../components/Loading";
import {fetchUpdateFlexStatus} from "./fetch";

export default function Main({history}) {
  const selectedAds = useSelector((state) => state.selectedAdverts);
  const filters = useSelector((state) => state.advertsURL);
  const [status, setStatus] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const accounts = useSelector((state) => {
    let accountComp = []
    Object.values(state.accounts.accounts).forEach(
      (account) => {
        if (account.permissions) {
          accountComp.push({
            name: account.name,
            id: account.id,
            permission:
              account.permissions.modules_id &&
              account.permissions.modules_id.find((i) => i === 6),
          });
        }
      }
    );
    const newArr = [];

    Object.values(state.selectedAdverts.advertsArray)
      .map((acc) =>
        accountComp.filter(
          (account) => account.id === acc.account_id && acc.checked
        )
      )
      .map((item) => item[0])
      .filter((item) => item !== undefined)
      .map((item) => {
        newArr.indexOf(item) === -1 && newArr.push(item);
        return item;
      });
    return newArr;
  });

  const noPermission = useMemo(() => {
    return accounts
      .filter((item) => item.permission !== 6)
      .map((item) => item.name);
  }, [accounts]);

  const allChecked = useMemo(() => {
    return selectedAds.allChecked;
  }, [selectedAds]);

  const advertsIds = useMemo(() => {
    const {advertsArray} = selectedAds;
    let advertIdsArray = [];
    for (const advert in advertsArray) {
      if (advertsArray[advert].checked)
        advertIdsArray.push(advertsArray[advert].id);
    }
    return [...advertIdsArray];
  }, [selectedAds]);

  useEffect(() => {
    if (!Object.keys(selectedAds.advertsArray).length && !allChecked)
      history.push("/anuncios");
  }, [history, selectedAds.advertsArray, allChecked]);

  function fetchChangeFlexStatus() {
    fetchUpdateFlexStatus({
      flexStatus: status,
      advertsIds,
      allChecked,
      setLoading,
      history,
      filters
    });
  }

  return (
    <Container>
      <Card className="card-accent-primary">
        <CardHeader>
          <h4 className="text-primary">Alterar Status de Envio Flex</h4>
        </CardHeader>
        <CardBody>
          <LoadPageHandler
            isLoading={loading}
            render={
              <>
                <SelectedAdsAmount/>
                <Row className="mt-3 justify-content-center">
                  <Col xs={6}>
                    <InputGroup>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="cil-truck"/>
                        </InputGroupText>
                      </InputGroupAddon>
                      <select
                        class="custom-select"
                        id="update-flex-shipping-status"
                        onChange={({target: {value}}) => setStatus(value)}
                      >
                        <option defaultChecked value="1">
                          Ativar Flex
                        </option>
                        <option value="0">Desativar Flex</option>
                      </select>
                    </InputGroup>
                  </Col>
                </Row>
              </>
            }
          />
        </CardBody>
        <CardFooter>
          <Row>
            <Col xs={6}>
              <Button type="button" onClick={() => history.push("/anuncios")}>
                <i className="cil-x"/> Cancelar
              </Button>
            </Col>
            <Col xs={6}>
              {!noPermission.length ? (
                <Button
                  style={{float: "left"}}
                  color="primary"
                  onClick={fetchChangeFlexStatus}
                >
                  <i className="cil-check"/> Executar
                </Button>
              ) : (
                <Button
                  style={{float: "left"}}
                  color="primary"
                  onClick={() => {
                    setOpenModal(true);
                  }}
                >
                  <i className="cil-check"/> Executar
                </Button>
              )}
            </Col>
          </Row>
          <ModalNoPermission
            openModal={openModal}
            noPermission={noPermission}
            closeModal={() => setOpenModal(false)}
            sendButton={fetchChangeFlexStatus}
          />
        </CardFooter>
      </Card>
    </Container>
  );
}
