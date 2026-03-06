import api          from "src/services/api";
import { getToken } from "src/services/auth";
import Swal         from "sweetalert2";

const requestDefaultOptions = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export const listFilesWithFilterString = async ({ filterString, page }) => {
  try {
    const url = `/storage/files?&page=${page}&limit=50&sort_name=name&sort_order=asc&filter_string=${filterString}`;
    const options = { headers: { Authorization: `Bearer ${getToken()}` } };
    return await api.get(url, options);
  } catch (error) {
    Swal.fire({
      title: "Erro!",
      type: "error",
      showCloseButton: true,
      text: error.response?.data?.message || error.message,
    });
    return false;
  }
};

export const createDiretory = async ({ setLoading, parentId, directoryName }) => {
  try {
    setLoading(true);
    const url = "/storage/directories/create";
    const payload = new FormData();
    parentId && payload.append("parent_id", parentId);
    payload.append("directory_name", directoryName);
    const response = await api.post(url, payload, requestDefaultOptions());
    return response?.data?.status === "success"
           ? response
           : false;
  } catch (error) {
    Swal.fire({
      title: "Erro!",
      type: "error",
      text: error.response?.data?.message || error.message,
      showCloseButton: true,
    });
    return false;
  } finally {
    setLoading(false);
  }
};

export const createFile = async ({ parentId, file }) => {
  try {
    const url = "/storage/files/create";
    const payload = new FormData();
    payload.append("parent_id", parentId);
    payload.append("file", file);
    const response = await api.post(url, payload, requestDefaultOptions());
    return response.data.status === "success" ? response : false;
  } catch (error) {
    return false;
  }
};

export const deleteFile = async ({ setLoading, fileId }) => {
  try {
    setLoading(true);
    const url = `/storage/files/${fileId}`;
    const response = await api.delete(url, requestDefaultOptions());
    return response?.data?.status === "success"
           ? response
           : false;
  } catch (error) {
    Swal.fire({
      title: "Erro!",
      type: "error",
      text: error.response?.data?.message || error.message,
      showCloseButton: true,
    });
    return false;
  } finally {
    setLoading(false);
  }
};

export const deleteMultipleFiles = async ({ filterString, confirmed, selectAll, filesIds, setLoading }) => {
  try {
    setLoading(true);
    const url = `/storage/files?select_all=${selectAll}&confirmed=${confirmed}${filterString && `&filter_string=${filterString}`}`;
    const formData = new FormData();
    formData.append("ids", filesIds);
    const response = await api.delete(url, { ...requestDefaultOptions(), data: formData });
    return response?.data?.status === "success"
           ? response
           : false;
  } catch (error) {
    Swal.fire({
      title: "Erro!",
      type: "error",
      text: error.response?.data?.message || error.message,
      showCloseButton: true,
    });
    return false;
  } finally {
    setLoading(false);
  }
};

export const downloadFile = async ({ fileId }) => {
  return `${process.env.REACT_APP_API_URL}storage/files/${fileId}`;
};

export const listFiles = async ({ setLoading, parentId, page }) => {
  try {
    setLoading(true);
    const url = `/storage/files?page=${page}&limit=50&sort_name=name&sort_order=asc${
      parentId ? `&parent_id=${parentId}` : ""
    }`;
    const response = await api.get(url, requestDefaultOptions());
    return response?.data?.status === "success"
           ? response
           : false;
  } catch (error) {
    Swal.fire({
      title: "Erro!",
      type: "error",
      text: error.response?.data?.message || error.message,
      showCloseButton: true,
    });
    return false;
  } finally {
    setLoading(false);
  }
};

export const listDirectories = async ({ setLoading }) => {
  try {
    setLoading(true);
    const url = `/storage/directories`;
    const response = await api.get(url, requestDefaultOptions());
    return response?.data?.status === "success"
           ? response
           : false;
  } catch (error) {
    Swal.fire({
      title: "Erro!",
      type: "error",
      text: error.response?.data?.message || error.message,
      showCloseButton: true,
    });
    if (error.response?.data) {
      return error.response.data;
    }
    return false;
  } finally {
    setLoading(false);
  }
};

export const createFilesTags = async ({ payload, setLoading, parentId, selectAll = 0 }) => {
  try {
    setLoading(true);
    const url = `/tags/files?confirmed=1&select_all=${selectAll}&parent_id=${parentId}`;
    const response = await api.post(url, payload, requestDefaultOptions());
    return response?.data?.status === "success"
           ? response
           : false;
  } catch (error) {
    Swal.fire({
      title: "Erro!",
      type: "error",
      text: error.response?.data?.message || error.message,
      showCloseButton: true,
    });
    return false;
  } finally {
    setLoading(false);
  }
};

export const deleteFilesTags = async ({ payload, setLoading, selectAll = 0 }) => {
  try {
    setLoading(true);
    const url = `/tags/files?confirmed=1&select_all=${selectAll}`;
    const requestOptions = { headers: { Authorization: `Bearer ${getToken()}` }, data: payload };
    const response = await api.delete(url, requestOptions);
    return response?.data?.status === "success"
           ? response
           : false;
  } catch (error) {
    Swal.fire({
      title: "Erro!",
      type: "error",
      text: error.response?.data?.message || error.message,
      showCloseButton: true,
    });
    return false;
  } finally {
    setLoading(false);
  }
};

export const fetchAllTags = async () => await api.get("/tags?type_id=3&sort_name=name&sort_order=asc", requestDefaultOptions());
