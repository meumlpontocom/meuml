export const getAdvertStatusColor = status => {
  switch (status) {
    case "closed":
      return "#f86c6b";
    case "paused":
      return "#ffc107";
    case "active":
      return "#4dbd74";
    case "under_review":
      return "#63c2de";
    default:
      return "#c8ced3";
  }
};
