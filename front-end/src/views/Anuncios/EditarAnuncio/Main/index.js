/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import requests from "./requests";
import { useDispatch, useSelector } from "react-redux";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import Card from "reactstrap/lib/Card";
import CardBody from "reactstrap/lib/CardBody";
import CardFooter from "reactstrap/lib/CardFooter";
import "./styles.scss";
import ImagesCarousel from "./ImagesCarousel";
import ConditionInput from "./Inputs/ConditionInput";
import TitleInput from "./Inputs/TitleInput";
import PriceInput from "./Inputs/PriceInput";
import AdType from "./Inputs/AdType";
import QuantityInput from "./Inputs/QuantityInput";
import DescriptionInput from "./Inputs/DescriptionInput";
import SaveEditionButton from "./SaveEditionButton";
import CleanEdit from "./CleanEdit";
import GoBackButton from "./GoBackButton";
import LoadPageHandler from "../../../../components/Loading";
import { toggleHighlight } from "../../../../redux/actions/_editAdvertActions";
import inputListToValidate from "./inputListToValidate";
import Gtin from "./Inputs/Gtin";
import ToggleAttributesBtn from "./ToggleAttributesBtn";
import ToggleController from "./ToggleController";
import Attributes from "./Attributes";

const AdvertsEditView = ({ history }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector(({ editAdvert }) => editAdvert);
  const { id, goals } = useSelector(getIdAndGoals);

  React.useEffect(() => {
    const validateHighlight = key => {
      const foundKeyInGoalsArray = goals.filter(({ id }) => id === key).length;
      if (foundKeyInGoalsArray) dispatch(toggleHighlight(key));
    };
    inputListToValidate.forEach(inputName => validateHighlight(inputName));
  }, []);

  React.useEffect(() => {
    if (!id) history.goBack();
    else requests.getAdvert({ dispatch, advertId: id, history });
  }, []);

  return (
    <LoadPageHandler
      isLoading={isLoading}
      render={
        <>
          <Row>
            <Col xs="12" sm="12" md="12" lg="12" xl="12">
              <Card>
                <CardBody>
                  <Row>
                    <ImagesCarousel />
                    <Col xs="12" md="4">
                      <div className="mb-2 categories-division categories-border">
                        <TitleInput />
                        <PriceInput />
                      </div>
                      <div className="categories-division">
                        <AdType />
                        <ConditionInput />
                        <QuantityInput />
                        <ToggleAttributesBtn />
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <ToggleController hiddenValue={true}>
                      <Col sm="12" md="8" className="py-2 border-top border-bottom">
                        <Gtin />
                      </Col>
                      <Col sm="12" md="8" className="pt-3 pb-2 border-bottom">
                        <DescriptionInput />
                      </Col>
                    </ToggleController>
                    <ToggleController hiddenValue={false}>
                      <Attributes />
                    </ToggleController>
                  </Row>
                </CardBody>
                <CardFooter>
                  <Row>
                    <Col sm="12" className="d-flex justify-content-end flex-wrap">
                      <GoBackButton history={history} />
                      <CleanEdit />
                      <SaveEditionButton advertId={id} history={history} />
                    </Col>
                  </Row>
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </>
      }
    />
  );
};

function getIdAndGoals({ qualityDetails }) {
  const { id, goals } = qualityDetails;
  return {
    id,
    goals: goals.filter(({ apply, progress }) => apply && !progress),
  };
}

export default AdvertsEditView;
