import React                                  from "react";
import Swal                                   from "sweetalert2";
import withReactContent                       from "sweetalert2-react-content";
import {
  InputGroup,
  InputGroupAddon,
  Input,
  InputGroupText,
  Container,
} from "reactstrap";
import { Provider, useDispatch, useSelector } from "react-redux";
import store                                  from "../../../../../redux/store";
import discountAction                         from "../../../../../redux/actions";

export default function DiscountBtn({ advert }) {
  const ReactSwal = withReactContent(Swal);
  const dispatch = useDispatch();
  const anyDiscountApplied = advert.original_price !== null;
  const eligibleForDiscount = Array.isArray(advert.external_data.tags)
    ? advert.external_data.tags?.filter(tag => tag === "loyalty_discount_eligible").length > 0
      ? true
      : false
    : false;

  const dynamicClassName = anyDiscountApplied
    ? "dropdown-item disabled"
    : eligibleForDiscount
    ? "dropdown-item"
    : "dropdown-item disabled";
  const handleDiscountConfigSubmit = () => {
    dispatch(discountAction({ label: "id", value: advert.external_id }));
    dispatch({ type: "FETCH_DISCOUNT" });
  };
  const firstClickResetValues = () => {
    dispatch(discountAction({ label: "discount", value: 0 }));
    dispatch(discountAction({ label: "premiumDiscount", value: 0 }));
    return;
  };
  const handleClick = () => {
    firstClickResetValues();
    ReactSwal.fire({
      html: (
        <Provider store={store}>
          <Container>
            <p className="mb-3">
              <strong>
                Configurar Desconto para o Anúncio {advert.external_id}
              </strong>
            </p>
            <table className="mb-3">
              <tbody>
                <tr>
                  <td>
                    <img
                      src={advert.external_data.secure_thumbnail}
                      alt="Thumbnail do anúncio"
                    />
                  </td>
                  <td>
                    <p>{advert.title}</p>
                    <p>
                      <small>
                        Valor original:{" "}
                        {advert.price.toLocaleString("pt-br", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </small>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
            <DefaultInput
              label="Data de Início"
              type="datetime-local"
              icon="calendar"
              tip="Quando o desconto deve entrar em vigor."
              id="initialDateTime"
            />
            <DefaultInput
              label="Data de Fim"
              type="datetime-local"
              icon="calendar-check"
              tip="Quando o desconto deve ser removido."
              id="endingDateTime"
            />
            <DefaultInput
              label="Desconto"
              icon="arrow-thick-bottom"
              type="number"
              isPercentageInput={true}
              tip="Desconto para todos os compradores."
              advertPrice={advert.price}
              id="discount"
            />
            <DefaultInput
              label="Desconto especial"
              icon="arrow-thick-to-bottom"
              type="number"
              isPercentageInput={true}
              tip="Desconto para compradores de nível superior."
              advertPrice={advert.price}
              id="premiumDiscount"
            />
          </Container>
        </Provider>
      ),
      // type: "question",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      showConfirmButton: true,
      confirmButtonText: "Confirmar",
    }).then((userChoice) => {
      if (userChoice.value) {
        return handleDiscountConfigSubmit();
      }
    });
  };
  return (
    <div className={dynamicClassName} onClick={() => handleClick()}>
      Aplicar Desconto
    </div>
  );
}

const DefaultInput = ({
  id,
  icon,
  label,
  type,
  tip,
  isPercentageInput,
  advertPrice,
}) => {
  const dispatch = useDispatch();
  const discountState = useSelector((state) => state.discount);
  const onChange = ({ label, value }) => {
    dispatchDiscountConfig({ label, value });
    handlePriceChange();
  };
  const handlePriceChange = () => {
    if (isPercentageInput) {
      if (discountState[id] < 0) {
        setInputFieldValue(0);
        dispatchDiscountConfig({ label: id, value: 0 });
      } else if (discountState[id] > 80) {
        setInputFieldValue(80);
        dispatchDiscountConfig({ label: id, value: 80 });
      }
    }
  };
  const setInputFieldValue = (value) => {
    return (document.querySelector(`#${id}`).value = value);
  };
  const dispatchDiscountConfig = ({ label, value }) => {
    return dispatch(discountAction({ label, value }));
  };
  const priceWithDiscount = () => {
    const convertToCurrency = (value) =>
      value.toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL",
      });
    return discountState[id]
      ? convertToCurrency(advertPrice - (discountState[id] / 100) * advertPrice)
      : convertToCurrency(advertPrice);
  };

  return (
    <InputGroup className="mb-3">
      <InputGroupAddon addonType="prepend">
        <InputGroupText>
          <span>
            {isPercentageInput ? (
              <>
                <strong>{label} % </strong>
              </>
            ) : (
              <>
                <i className={`cil-${icon} mr-1`} /> {label}
              </>
            )}
          </span>
        </InputGroupText>
      </InputGroupAddon>
      {isPercentageInput ? (
        <Input
          type={type}
          min="5"
          max="80"
          step="1"
          id={id}
          onChange={(event) =>
            onChange({ label: event.target.id, value: event.target.value })
          }
        />
      ) : (
        <Input
          type={type}
          id={id}
          onChange={(event) =>
            onChange({ label: event.target.id, value: event.target.value })
          }
        />
      )}
      {isPercentageInput ? (
        <InputGroupAddon addonType="append" title={tip}>
          <InputGroupText>
            {label === "Desconto especial" ? <small>(opcional) </small> : null}
            {priceWithDiscount()}
          </InputGroupText>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
};
