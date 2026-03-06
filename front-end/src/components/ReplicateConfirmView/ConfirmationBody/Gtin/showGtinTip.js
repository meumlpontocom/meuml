import Swal from "sweetalert2";

const showGtinTip = async () => await Swal.fire({
  title: "GTIN / EAN",
  type: "info",
  html: `
  <ul class="text-left">
    <li>
      Se o anúncio de origem não possuir um código EAN válido, seu anúncio também ficará sem EAN.
    </li>
    <li>
      Você pode garantir que seu anúncio tenha um EAN válido informando no campo GTIN, no cartão de atributos.
    </li>
    <li>
      O EAN ou GTIN pode ser um dado obrigatório para algumas categorias de anúncio do Mercado Livre.
      Nestes casos, não possuir um EAN pode significar a moderação do anúncio.
    </li>
  </ul>
  `
});

export default showGtinTip;
