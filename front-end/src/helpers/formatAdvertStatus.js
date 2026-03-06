export const formatAdvertStatus = status => {
  switch (status) {
    case "closed":
      return "Finalizado";
    case "paused":
      return "Pausado";
    case "active":
      return "Ativo";
    case "under_review":
      return "Em revisão";
    default:
      return "";
  }
};
