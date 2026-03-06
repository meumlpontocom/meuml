import React                        from "react";
import Swal                         from "sweetalert2";
import { useDispatch }              from "react-redux";

import { fetchProductStatusMshops, getAProductsMshops } from "../../requests";

export default function ProductStatusDropdown({ action, externalId, status }) {
    const dispatch = useDispatch();
    const actions = ["Pausar", "Ativar", "Finalizar", "Excluir"];
    const handleClick = () => {

        if (action === 3) {
            Swal.fire({
                title: "Atenção!",
                type: "warning",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: "Sim, tenho certeza",
                cancelButtonText: "Cancelar",
                html: `
                    <p>Você tem certeza que deseja <b>EXCLUIR PERMANENTEMENTE</b> o anúncio ${externalId}?</p>
                    <p>Você não poderá reativá-lo depois!</p>
                    `,
            }).then((user) => {
                if (user.value) {
                    if (status !== "closed") {
                            Swal.fire({
                                title: "Atenção",
                                type: "info",
                                html: "<p>O anúncio precisa ser FINALIZADO antes de ser EXCLUÍDO definitivamente.</p>",
                                showCloseButton: true,
                            });
                    } else fetchApi();
                }
            });
        } else fetchApi();
    };

    const fetchApi = async (confirmed = 0) => {
        try {

            const status = 
                action === 0 ? "paused" 
                : action === 1 ? "active" 
                : action === 2 ? "closed" 
                : action === 3;
                
            const formData = new FormData();
            formData.append("status", status);
            formData.append("advertisings_id", externalId);

            const response = await fetchProductStatusMshops({ formData, confirmed, dispatch });

            if (!confirmed) {
                Swal.fire({
                    title: "Atenção",
                    type: "question",
                    showConfirmButton: true,
                    confirmButtonText: "Prosseguir",
                    showCancelButton: true,
                    cancelButtonText: "Cancelar",
                      html: `<p>${response.message}</p>`,
                }).then((user) => {
                    if (user.value) {
                        fetchApi(1);
                    }
                });
            } else handleApiResponse({ response });
        } catch (error) {
            if (error.response) {
                return error.response;
            }
            return error;
        }
    };

    const handleApiResponse = ({ response }) => {
        try {
            if (response.data.message || response.message) {
                Swal.fire({
                    title: "Atenção",
                    html: `<p>${response.data.message || response.message}</p>`,
                    showCloseButton: true,
                    type: response.data.status || response.status,
                }).then(() => getAProductsMshops({ dispatch }));
            }
        } catch (error) {
            Swal.fire({
                title: "Erro",
                html: `<p>${error}</p>`,
                type: "error",
                showCloseButton: true,
            });
        }
    };
    return (
        <div
            className="dropdown-item"
            onClick={() => handleClick()}
            style={{ cursor: "pointer" }}
        >
            {actions[action]} Anúncio
        </div>
    );
}
