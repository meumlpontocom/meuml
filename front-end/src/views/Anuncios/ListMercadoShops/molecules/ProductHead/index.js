import React from "react";

const ProductHead = () => {

    return (
        <>
            <thead className="thead-light">
                <tr>
                    <th></th>
                    <th
                        title={"Marcar todos da página"}
                    >
                        <i className="cil-check" />
                    </th>
                    <th>Foto</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th></th>
                </tr>
            </thead>
        </>
    );
};

export default ProductHead;
