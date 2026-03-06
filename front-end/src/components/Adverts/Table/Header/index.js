import { useSelector } from "react-redux";

const TableHeader = () => {
  const allChecked = useSelector(state => state.selectedAdverts.allChecked);
  const pagesAllChecked = useSelector(state => state.selectedAdverts.pagesAllChecked);
  const checked = allChecked ? true : pagesAllChecked;
  return (
    <thead className="thead-light">
      <tr>
        <th></th>
        <th title={checked ? "Desmarcar todos da página" : "Marcar todos da página"}>
          {checked ? <i className="cil-minus" /> : <i className="cil-check" />}
        </th>
        <th>Foto</th>
        <th>Descrição</th>
        <th>Tags</th>
        <th>Valor</th>
        <th>Opções</th>
      </tr>
    </thead>
  );
};

export default TableHeader;
