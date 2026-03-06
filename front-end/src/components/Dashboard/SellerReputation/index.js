import React, { useEffect, useState } from "react";
import { Data } from "../../../containers/Data";
import SelectAccount from "../buttons/SelectAccount";
import { Progress, Col, Card, CardBody, CardHeader, CardFooter, Row } from "reactstrap";
import "./index.css";

const LevelId = () => {
  return (
    <Row id="account_data">
      <Data.Consumer>
        {provider => {
          let { level_id, power_seller_status } = provider.state.selectedAccount.external_data.seller_reputation;
          return (
            !provider.isLoading && (
              <AccountLevel
                id={level_id}
                avatar={provider.state.avatar}
                status={power_seller_status}
                name={provider.state.selectedAccount.name}
              />
            )
          );
        }}
      </Data.Consumer>
    </Row>
  );
};

const AccountLevel = props => {
  const [Avatar, setAvatar] = useState(props.avatar);
  const [Name, setName] = useState(null);

  useEffect(() => {
    props.avatar && setAvatar(props.avatar);
    props.name && setName(props.name);
  }, [props.avatar, props.name]);

  switch (props.id) {
    case null:
      return <MainCard name={Name} color="#ffff" value={10} title={"0"} statusTranslation={""} avatar={Avatar} />;
    default:
      const statusTranslation = validateStar(props.status);
      const color = props.id.substring(2);
      const miniValue = props.id.substring(0, 1);
      const value = scaleConvert(miniValue);
      return (
        <MainCard
          name={Name}
          avatar={Avatar}
          color={color}
          value={value}
          title={value}
          statusTranslation={statusTranslation}
        />
      );
  }
};

const MainCard = ({ avatar, name, color, value, statusTranslation }) => {
  return (
    <Col xs="12" sm="6" md="4" lg="4">
      <Card className="img-card">
        <CardHeader>
          <SelectAccount />
        </CardHeader>
        <CardBody className="img-card-body">
          <img
            src={avatar}
            title="Imagem da Conta"
            className="img-full70 align-content-center"
            alt="Imagem da Conta"
            id="account_avatar"
            name="account_avatar"
          />
          <h6 className="text-center">{!name ? "Selecione uma conta" : name}</h6>
        </CardBody>
        <CardFooter className="text-left">
          <Star status={statusTranslation} />
          <Progress className="progress-xs" color={color} value={value} title={value} />
        </CardFooter>
      </Card>
    </Col>
  );
};

const Star = ({ status }) => {
  switch (status) {
    case "silver":
      return <i id="star-silver" className="cil-star font-lg" title="Prata"></i>;
    case "gold":
      return <i id="star-gold" className="cil-star font-lg" title="Ouro"></i>;
    case "platinum":
      return <i id="star-platinum" className="cil-star font-lg" title="Platina"></i>;
    default:
      return (
        <i
          id="star-no_avaliation"
          className="cil-star font-lg"
          title="Sua conta não possui vendas suficientes para ser avaliada."
        ></i>
      );
  }
};

const scaleConvert = props => {
  if (props === 1 || props === "1") return 20;
  else if (props === 2 || props === "2") return 40;
  else if (props === 3 || props === "3") return 60;
  else if (props === 4 || props === "4") return 80;
  else if (props === 5 || props === "5") return 100;
  else return 0;
};

const validateStar = props => {
  if (props === null) return "platinum";
  else if (props.status === "silver") return "Prata";
  else if (props.status === "gold") return "Ouro";
  else if (props.status === "platinum") return "Platina";
  else return false;
};

export default LevelId;
