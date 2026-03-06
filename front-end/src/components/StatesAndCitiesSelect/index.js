import React, { useCallback, useEffect, useRef } from "react";
import { StyledPicky }                           from "../StyledPicky";
import { toast }                                 from "react-toastify";
import { useDispatch, useSelector }              from "react-redux";
import PropTypes                                 from "prop-types";
import "./index.scss";
import axios                                     from "axios";

const locationSelectionTip = () => {
  if (!toast.isActive("locationSelectionTip")) {
    const Attention = ({ children }) =>
      <strong>{String(children).toUpperCase()}</strong>;
    const _config = {
      toastId: "locationSelectionTip",
      type: toast.TYPE.WARNING,
      autoClose: 25/*miliseconds*/ * 1000,
    };
    const Message = () => (
      <div className="text-white">
        <h3>Atenção!</h3>
        <p>
          Ao digitar seu CEP corretamente, os dados
          de <Attention>estado</Attention> e <Attention>cidade</Attention> serão <u>preenchidos
                                                                                    pelo
                                                                                    sistema</u>.
        </p>
      </div>
    );
    toast(<Message />, _config);
  }
};

const StatesOfBrazilSelect = ({ multiple, selectAllBtn }) => {
  const dispatch = useDispatch();
  const { availableStates, selectedStates } = useSelector(state => state.geo);

  const fetchStatesAndCitiesOfBrazil = useCallback(async () => {
    const statesOfBrazilRepositoryUrl = process.env.REACT_APP_STATES_JSON;
    if (!availableStates.length) {
      const response = await axios.get(statesOfBrazilRepositoryUrl);
      dispatch({
        type: "SET_AVAILABLE_STATE_LIST",
        states: response.data.estados,
      });
    }
  }, [availableStates, selectedStates, axios, dispatch]);

  const setSelectedStates = useCallback((selected) => {
    dispatch({ type: "SET_SELECTED_STATE_LIST", states: selected });
  }, [dispatch]);

  useEffect(() => {
    fetchStatesAndCitiesOfBrazil();
  }, []);

  return (
    <StyledPicky
      onOpen={() => locationSelectionTip()}
      value={selectedStates}
      options={availableStates}
      onChange={setSelectedStates}
      valueKey="sigla"
      labelKey="nome"
      multiple={multiple}
      includeFilter={true}
      placeholder="Selecione..."
      includeSelectAll={selectAllBtn}
      name="select-states-of-brasil"
      selectAllText="Selecionar todos"
      filterPlaceholder="Pesquisar . . ."
      allSelectedPlaceholder="%s selecionados"
      manySelectedPlaceholder="%s selecionados"
    />
  );
};

StatesOfBrazilSelect.propTypes = {
  selectedState: PropTypes.string,
  multiple: PropTypes.bool,
  selectAll: PropTypes.bool,
};

StatesOfBrazilSelect.defaultProps = {
  multiple: false,
  selectAll: false,
  selectedState: "",
};

const CitiesOfBrazilSelect = ({ multiple, selectAllBtn }) => {
  const ref = useRef(null);
  const dispatch = useDispatch();
  const selectedCities = useSelector(state => state.geo.selectedCities);
  const availableCities = useSelector(state => state.geo.availableCities);

  function setSelectedCities(selected) {
    dispatch({ type: "SET_SELECTED_CITIES", cities: selected });
  }

  return (
    <StyledPicky
      ref={ref}
      onOpen={() => locationSelectionTip()}
      value={selectedCities}
      options={availableCities}
      onChange={setSelectedCities}
      valueKey="value"
      labelKey="label"
      multiple={multiple}
      includeFilter={true}
      placeholder="Selecione..."
      includeSelectAll={selectAllBtn}
      name="select-cities-of-brasil"
      selectAllText="Selecionar todos"
      filterPlaceholder="Pesquisar . . ."
      allSelectedPlaceholder="%s selecionados"
      manySelectedPlaceholder="%s selecionados"
    />
  );
};

CitiesOfBrazilSelect.propTypes = {
  multiple: PropTypes.bool,
  selectAllBtn: PropTypes.bool,
  selectedCity: PropTypes.string,
};

CitiesOfBrazilSelect.defaultProps = {
  multiple: false,
  selectAllBtn: false,
  selectedCity: "",
};

export { StatesOfBrazilSelect, CitiesOfBrazilSelect };
