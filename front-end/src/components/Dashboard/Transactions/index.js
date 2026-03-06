import React from 'react';
import { Col, Row } from 'reactstrap';
import { Data } from '../../../containers/Data';
import Widget02 from '../../widgets/Widget02';

const Transactions = () => {
  return (
    <Data.Consumer>
      {provider => (
        provider.state.isLoading ? (<div />) : provider.state.accountsFound > 0 ? (<>
          <h5>Vendas</h5>
          <Row>
            <Col xs="12" sm="12" md="4" lg="4">
              <Widget02
                header={provider.state.selectedAccount.external_data.seller_reputation.transactions.total || '-'}
                mainText="TOTAL" icon="fa fa-calculator" color="dark"
              />
            </Col>
            <Col xs="12" sm="12" md="4" lg="4">
              <Widget02
                header={provider.state.selectedAccount.external_data.seller_reputation.transactions.completed || '-'}
                mainText="Concretizadas" icon="fa fa-check" color="success"
              />
            </Col>
            <Col xs="12" sm="12" md="4" lg="4">
              <Widget02
                header={provider.state.selectedAccount.external_data.seller_reputation.transactions.canceled || '-'}
                mainText="Canceladas" icon="fa fa-ban" color="danger"
              />
            </Col>
            <LastFourMonths
              period={provider.state.selectedAccount.external_data.seller_reputation.metrics.sales.period}
              completed={provider.state.selectedAccount.external_data.seller_reputation.metrics.sales.completed}>
            </LastFourMonths>
          </Row>

        </>) : (<div />))
      }
    </Data.Consumer>
  );
}

const LastFourMonths = sales => {
  if (sales.period === '60 months') {
    return <div />
  }
  return (
    <Col xs="12" sm="6" lg="3">
      <Widget02
        header={sales.completed || '-'}
        mainText="Últimos 4 meses"
        icon="fa fa-undo"
        color="warning"
      />
    </Col>
  );
}

export default Transactions;
