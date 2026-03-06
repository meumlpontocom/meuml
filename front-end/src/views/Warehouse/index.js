import React, { useCallback, useEffect, useState } from "react";
import { useHistory }                              from "react-router-dom";
import Swal                                        from "sweetalert2";
import api                                         from "../../services/api";
import { getToken }                                from "src/services/auth";
import PageHeader                                  from "../../components/PageHeader";
import WarehouseInput                              from "./WarehouseInput";
import WarehousesList                              from "./WarehousesList";
import CallToAction                                from "src/views/CallToAction";

function handleError(err) {
  return Swal.fire({
    title: "Ops!",
    html: `<p>${err.response ? err.response.data.message : err}</p>`,
    type: "error",
    showCloseButton: true,
  });
}

const Warehouse = () => {
  const [error402, setError402] = useState(() => false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [defaultWarehouse, setDefaultWarehouse] = useState(false);
  const [updateName, setUpdateName] = useState("");
  const [updateCode, setUpdateCode] = useState("");
  const [editing, setEditing] = useState(0);
  const [warehouses, setWarehouses] = useState([]);

  const [isPending, setIsPending] = useState(false);
  const [isPendingEdit, setIsPendingEdit] = useState(false);
  const [isPendingDefault, setIsPendingDefault] = useState(false);

  const history = useHistory();

  async function postWarehouse() {
    const data = {
      name: name,
      code: code,
      is_default: warehouses.length === 0 || defaultWarehouse,
    };

    return await api.post("/warehouses", data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  }

  function addWarehouse() {
    if (name === "" || code === "") return;
    setIsPending(true);
    if (defaultWarehouse) {
      replaceDefault();
    }
    postWarehouse()
      .then(async () => {
        await getAndSetWarehouses();
        setIsPending(false);
      })
      .catch((error) => handleError(error).then(() => history.push("/home")));

    setName("");
    setCode("");
    setDefaultWarehouse(false);
  }

  function handleEdit(key) {
    setEditing(Number(key));
  }

  function handleDelete(id, setIsDeleting) {
    async function deleteWarehouse() {
      return await api.delete(`/warehouses/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    }

    deleteWarehouse()
      .then(async () => await getAndSetWarehouses())
      .catch((error) => handleError(error))
      .finally(() => setIsDeleting(false));
  }

  async function updateWarehouse(id) {
    if (updateName === "" || updateCode === "") return;
    const data = {
      name: updateName,
      code: updateCode,
    };

    return await api.put(`/warehouses/${id}`, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  }

  function handleUpdate(id) {
    setIsPendingEdit(true);
    const updatedWarehouse = {
      id: id,
      code: updateCode.trim(),
      name: updateName.trim(),
      isPrimary: defaultWarehouse,
    };
    const warehouseIndex = warehouses.findIndex(
      (warehouse) => warehouse.id === id,
    );
    const warehousesList = [...warehouses];
    warehousesList[warehouseIndex] = updatedWarehouse;
    updateWarehouse(id)
      .then(async () => {
        await getAndSetWarehouses();
        setIsPendingEdit(false);
        setEditing(0);
      })
      .catch((error) => handleError(error).then(() => history.push("/home")));

    setUpdateName("");
    setUpdateCode("");

    setWarehouses(warehousesList);
  }

  function handleClean() {
    setUpdateCode("");
    setUpdateName("");
    setEditing(0);
  }

  function replaceDefault() {
    const warehousesList = [...warehouses];
    setWarehouses(
      warehousesList.map((warehouse) => (warehouse.is_default = false)),
    );
  }

  function defaultButton(id) {
    setIsPendingDefault(true);

    async function setUserDefaultWarehouse() {
      return await api.post(
        `/warehouses/${id}/user-default`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
    }

    setUserDefaultWarehouse()
      .then(() => {
        setIsPendingDefault(false);
      })
      .catch((error) => handleError(error).then(() => history.push("/home")));

    replaceDefault();
    const warehousesList = [...warehouses];
    const warehouseIndex = warehousesList.findIndex(
      (warehouse) => warehouse.id === id,
    );
    const defaultWarehouse = warehousesList[warehouseIndex];
    defaultWarehouse.is_default = true;
    warehousesList.splice(warehouseIndex, 1, defaultWarehouse);
    setWarehouses(warehousesList);
  }

  async function getWarehouses() {
    return await api.get("/warehouses", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  }

  const getAndSetWarehouses = useCallback(async function () {
    await getWarehouses()
      .then((res) => {
        setWarehouses(res.data.data);
      })
      .catch((error) => {
        if (error.response?.data.statusCode === 402) {
          setError402(true);
        }
        handleError(error);
      });
  }, []);

  useEffect(() => {
    getAndSetWarehouses();
  }, [getAndSetWarehouses]);

  return error402 ? (
    <CallToAction />
  ) : (
    <>
      <PageHeader heading="Cadastro de Armazéns" />
      <WarehouseInput
        name={name}
        setName={setName}
        code={code}
        setCode={setCode}
        warehouses={warehouses}
        addWarehouse={addWarehouse}
        defaultWarehouse={defaultWarehouse}
        setDefaultWarehouse={setDefaultWarehouse}
        isPending={isPending}
      />
      <WarehousesList
        warehouses={warehouses}
        editing={editing}
        updateCode={updateCode}
        setUpdateCode={setUpdateCode}
        updateName={updateName}
        setUpdateName={setUpdateName}
        handleClean={handleClean}
        handleUpdate={handleUpdate}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        defaultWarehouse={defaultWarehouse}
        defaultButton={defaultButton}
        isPending={isPending}
        isPendingEdit={isPendingEdit}
        isPendingDefault={isPendingDefault}
      />
    </>
  );
};

export default Warehouse;
