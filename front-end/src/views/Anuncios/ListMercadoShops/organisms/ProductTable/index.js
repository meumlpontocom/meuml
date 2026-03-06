import React            from "react";
import { useSelector }  from "react-redux";
import Table            from "reactstrap/lib/Table";


import ProductHead      from "../../molecules/ProductHead/index";
import ProductBody      from '../../molecules/ProductBody/index';

export default function ProductTable({history}){
  const { products } = useSelector((state) => state.mshops);
  
  return Object.keys(products).length ? (
    <Table className="table table-sm" style={{ minHeight: "121px" }}>
      <ProductHead />
      <ProductBody history={history}/>
    </Table>
  ) : (
    <></>
  );
};
