import React from "react";
import { Redirect } from "react-router-dom";

const Warehouse = React.lazy(() => import("./views/Warehouse"));
const CatalogCharts = React.lazy(() => import("./views/Anuncios/CatalogCharts"));
const VacationMode = React.lazy(() => import("./views/VacationMode"));
const ShopeeAdverts = React.lazy(() => import("./views/ShopeeAdverts"));
const Novidades = React.lazy(() => import("./views/Novidades"));
const Dashboard = React.lazy(() => import("./views/Dashboard"));
const Adverts = React.lazy(() => import("./views/Anuncios"));
const CreateAdvert = React.lazy(() => import("src/views/Anuncios/Create"));
const Contas = React.lazy(() => import("./views/Contas/ListaContas"));
const CallBack = React.lazy(() => import("./views/Contas/CallBack"));
const Processos = React.lazy(() => import("./views/Processos"));
const ReplicationsHistory = React.lazy(() => import("./views/ReplicationsHistory"));
const Admin = React.lazy(() => import("./views/Admin"));
const Perguntas = React.lazy(() => import("./views/Perguntas"));
const AssinaturaVigente = React.lazy(() => import("./views/AssinaturaVigente"));
const Pagamento = React.lazy(() => import("./views/Payment"));
const Creditos = React.lazy(() => import("./views/Creditos"));
const Extrato = React.lazy(() => import("./views/Extrato"));
const Catalogo = React.lazy(() => import("./views/Anuncios/Catalogo"));
const SalesView = React.lazy(() => import("./views/Vendas"));
const ModerationsView = React.lazy(() => import("./views/Moderations"));
const AdvertEdit = React.lazy(() => import("./views/Anuncios/EditarAnuncio"));
const Logout = React.lazy(() => import("./views/Autenticacao/Logout"));
const InvoicesView = React.lazy(() => import("./views/Invoices"));
const ImagesStore = React.lazy(() => import("./views/ImagesStore"));
const Etiquetas = React.lazy(() => import("./views/Etiquetas"));
const AdvertisingUpdate = React.lazy(() => import("./views/Anuncios/Update"));
const ShopeeReplicateSelf = React.lazy(() => import("./views/ShopeeReplicateSelf"));
const ShopeeReplicateToML = React.lazy(() => import("./views/ShopeeReplicateToML"));
const ShopeeCallback = React.lazy(() => import("./views/Contas/CallBack/ShopeeCallback"));
const MassFooterHeaderChange = React.lazy(() => import("./views/Anuncios/HeaderFooterEmMassa"));
const MassChangePrice = React.lazy(() => import("./views/Anuncios/PrecoEmMassa"));
const MassDiscountPrice = React.lazy(() => import("./views/Anuncios/DescontoEmMassa"));
const MassTextFix = React.lazy(() => import("./views/Anuncios/TextoFixoEmMassa"));
const MassDescription = React.lazy(() => import("./views/Anuncios/DescricaoEmMassa"));
const QualidadeDoAnuncio = React.lazy(() => import("./views/Anuncios/QualidadeDoAnuncio"));
const ViewsHistory = React.lazy(() => import("./views/Anuncios/HistoricoDeVisitas"));
const AdvertImgQuality = React.lazy(() => import("./components/AdvertImgQuality"));
const PositioningDetails = React.lazy(() => import("./views/Anuncios/DetalhesPosicionamento"));
const AtualizarStatusEmMassa = React.lazy(() => import("./views/Anuncios/AtualizarStatusEmMassa"));
const PrazoDeEnvios = React.lazy(() => import("./views/Anuncios/PrazoDeEnvios"));
const BloquearComprador = React.lazy(() => import("./views/Bloqueios/BloquearComprador"));
const BloquearEmMassa = React.lazy(() => import("./views/Bloqueios/BloquearEmMassa"));
const BloquearLista = React.lazy(() => import("./views/Bloqueios/BloquearLista"));
const MeusBloqueios = React.lazy(() => import("./views/Bloqueios/MeusBloqueios"));
const MinhasListasDeBloqueios = React.lazy(() => import("./views/Bloqueios/MinhasListasDeBloqueios"));
const HistoricoAssinatura = React.lazy(() => import("./views/HistoricoAssinatura"));
const EnvioFlexEmMassa = React.lazy(() => import("./views/Anuncios/EnvioFlexEmMassa"));
const ConfigurarAreaDeCoberturaFlex = React.lazy(() => import("./views/ConfigurarAreaDeCoberturaFlex"));
const ConfigurarEnvioFlex = React.lazy(() => import("./views/ConfigurarEnvioFlex"));
// const ReplicadorDeAnuncios = React.lazy(() => import("./views/Anuncios/Replicador"));
const EditarAltaQualidade = React.lazy(() => import("./views/Anuncios/EditarAltaQualidade"));
const ReplicateConfirmView = React.lazy(() => import("./components/ReplicateConfirmView"));
const ReplicateConfirmViewShopee = React.lazy(() => import("./components/ReplicateConfirmViewShopee"));
const RegisteredProducts = React.lazy(() => import("./views/RegisteredProducts"));
const ProductRegistration = React.lazy(() => import("./views/ProductRegistration"));
const Assinaturas = React.lazy(() => import("./views/PlanSignUp"));
const WelcomeScreen = React.lazy(() => import("./views/WelcomeScreen"));
// const ShopeeBulkPriceUpdate         = React.lazy(() => import("./views/ShopeeBulkPriceUpdate"));
const ShopeeIncreasePrice = React.lazy(() => import("./views/ShopeeIncreasePrice"));
const WarehouseDefaults = React.lazy(() => import("./views/WarehouseDefaults"));
const Inventory = React.lazy(() => import("./views/Inventory"));
const InventoryReports = React.lazy(() => import("./views/InventoryReports"));
const WhatsAppConfig = React.lazy(() => import("./views/WhatsAppConfig"));
const ListMercadoShops = React.lazy(() => import("./views/Anuncios/ListMercadoShops"));
const IpConfig = React.lazy(() => import("./views/Admin/IpConfig"));
const ShippingSchedule = React.lazy(() => import("./views/ShippingSchedule"));
const DetalhesDaQualidade = React.lazy(() =>
  import("./views/Anuncios/QualidadeDoAnuncio/DetalhesDaQualidade"),
);
const MShopsAtualizarStatusEmMassa = React.lazy(() =>
  import("./views/Anuncios/MShopsAtualizarStatusEmMassa"),
);
const SearchPublicInfo = React.lazy(() => import("./views/SearchPublicInfo"));

const routes = [
  {
    path: "/configuracoes/ip",
    name: "Configurar IPs",
    id: "ip-settings",
    component: IpConfig,
  },
  {
    path: "/armazem",
    name: "Armazém",
    id: "warehouse",
    component: Warehouse,
  },
  {
    path: "/vendas/etiquetas",
    name: "Etiquetas",
    id: "sales-shipping-tags",
    component: Etiquetas,
  },
  {
    path: "/anuncios/editar/:advertId",
    name: "Editar Anúncio",
    id: "advertising-update",
    component: AdvertisingUpdate,
  },
  {
    path: "/shopee/subir-preco",
    name: "Subir Preço",
    id: "shopee-price-update",
    component: ShopeeIncreasePrice,
  },
  // {
  //   path: "/shopee/alterar-preco",
  //   name: "Alterar Preço em Massa",
  //   id: "shopee-bulk-price-update",
  //   component: ShopeeBulkPriceUpdate,
  // },
  {
    path: "/modo-ferias",
    name: "Modo Férias",
    id: "vacation-mode",
    component: VacationMode,
  },
  {
    path: "/solicitar-nota-fiscal",
    name: "Solicitar Nota Fiscal",
    id: "Solicitar Nota Fiscal",
    component: InvoicesView,
  },
  {
    path: "/replicar-anuncios-shopee",
    name: "Replicar Anúncios Shopee",
    id: "replicate-shopee",
    component: ShopeeReplicateSelf,
    exact: true,
  },
  {
    path: "/replicar-anuncios-shopee/mercado-livre",
    name: "Replicar Shopee para Mercado Livre",
    id: "replicate-shopee-ml",
    component: ShopeeReplicateToML,
    exact: true,
  },
  {
    path: "/anuncios-shopee",
    name: "Anúncios Shopee",
    id: "anuncios-shopee",
    component: ShopeeAdverts,
  },
  {
    path: "/vendas",
    name: "Vendas",
    id: "Vendas",
    component: SalesView,
  },
  {
    path: "/contas/moderacoes",
    name: "Moderações",
    id: "moderacoes",
    component: ModerationsView,
  },

  {
    path: "/dashboard",
    name: "Painel de Controle",
    component: Dashboard,
  },
  {
    path: "/shopee/callback/add/:credentials",
    name: "Shopee Auth",
    component: ShopeeCallback,
  },
  {
    path: "/novidades",
    name: "Novidades",
    id: "novidades",
    component: Novidades,
  },
  {
    path: "/catalogo",
    name: "Catálogo",
    id: "catalogo",
    component: Catalogo,
  },
  {
    path: "/anuncios",
    name: "Anúncios",
    id: "anuncios",
    component: Adverts,
    exact: true,
  },
  {
    path: "/criar-anuncio",
    name: "Criação de Anúncios",
    id: "criação-de-anuncios",
    component: CreateAdvert,
  },
  {
    path: "/editar-para-alta-qualidade",
    name: "Edição para Anúncios de Alta Qualidade",
    id: "/editar-para-alta-qualidade",
    component: EditarAltaQualidade,
  },
  {
    path: "/qualidade-do-anuncio/:id",
    name: "Detalhes da Qualidade",
    id: "quality-details",
    component: DetalhesDaQualidade,
  },
  // {
  //   path: "/replicar-anuncios",
  //   name: "Replicador de Anúncios",
  //   id: "replicador-de-anuncios",
  //   component: ReplicadorDeAnuncios,
  // },
  {
    path: "/confirmar-replicacao-de-anuncios",
    name: "Confirmar Replicação de Anúncios",
    id: "confirmar-replicacao-de-anuncios",
    component: ReplicateConfirmView,
  },
  {
    path: "/confirmar-replicacao-de-anuncios-shopee",
    name: "Confirmar Replicação de Anúncios Shopee",
    id: "confirmar-replicacao-de-anuncios-shopee",
    component: ReplicateConfirmViewShopee,
  },
  {
    path: "/anuncios/atualizar-prazo-de-envios-em-massa",
    name: "Atualizar Prazo de Envios em Massa",
    id: "/anuncios/atualizar-prazo-de-envios-em-massa",
    component: PrazoDeEnvios,
  },
  {
    path: "/anuncios/atualizar-status-envio-flex",
    name: "Atualizar Status de Envio Flex",
    id: "/anuncios/atualizar-status-envio-flex",
    component: EnvioFlexEmMassa,
  },
  {
    path: "/configurar-envio-flex/:accountId",
    name: "Configurar Envio Flex",
    id: "/configurar-envio-flex",
    component: ConfigurarEnvioFlex,
  },
  {
    path: "/configurar-area-de-cobertura-flex/:accountId",
    name: "Configurar Área de Cobertura Flex",
    id: "/configurar-area-de-cobertura-flex",
    component: ConfigurarAreaDeCoberturaFlex,
  },
  {
    path: "/anuncios/atualizar-status-em-massa",
    name: "Atualizar Status em Massa",
    id: "/anuncios/atualizar-status-em-massa",
    component: AtualizarStatusEmMassa,
  },
  {
    path: "/anuncios/alterar-header-footer-em-massa",
    name: "Alterar Header e Footer em Massa",
    id: "alterar-header-footer-em-massa",
    component: MassFooterHeaderChange,
  },
  {
    path: "/anuncios/alterar-precos-em-massa",
    name: "Alterar Preços em Massa",
    id: "alterar-precos-em-massa",
    component: MassChangePrice,
  },
  {
    path: "/anuncios/descontos-em-massa",
    name: "Desconto em Massa",
    id: "descontos-em-massa",
    component: MassDiscountPrice,
  },
  {
    path: "/anuncios/alterar-texto-fixo-em-massa",
    name: "Alterar texto fixo em Massa",
    id: "alterar-texto-fixo-em-massa",
    component: MassTextFix,
  },
  {
    path: "/anuncios/substituir-texto-descricao-em-massa",
    name: "Substituir texto descrição em Massa",
    id: "substituir-texto-descricao-em-massa",
    component: MassDescription,
  },
  {
    path: "/anuncios/editar-anuncio",
    name: "Editar anúncio",
    id: "advert-edit",
    component: AdvertEdit,
  },
  {
    path: "/qualidade-do-anuncio",
    name: "Qualidade",
    id: "advert-quality",
    component: QualidadeDoAnuncio,
  },
  {
    path: "/qualidade-das-imagens",
    name: "Qualidade das Imagens",
    id: "advert-image-quality",
    component: AdvertImgQuality,
  },
  {
    path: "/historico-de-visitas/:id",
    name: "Histórico de visitas",
    id: "views-history",
    component: ViewsHistory,
  },
  {
    path: "/posicionamento/:id",
    name: "Estatísticas do Anúncio",
    id: "positioningDetails",
    component: PositioningDetails,
  },
  { path: "/contas", name: "Contas", component: Contas },
  {
    path: "/callback",
    name: "Adicionar Conta Meli",
    component: CallBack,
  },
  {
    path: "/shopee/callback/add/:code/:shopid",
    name: "Adicionar Conta Shopee",
    component: ShopeeCallback,
  },
  {
    path: "/bloquearcomprador",
    name: "Bloquear Comprador",
    component: BloquearComprador,
  },
  {
    path: "/bloquearemmassa",
    name: "Bloquear em Massa",
    component: BloquearEmMassa,
  },
  {
    path: "/meusbloqueios",
    name: "Meus Bloqueios",
    component: MeusBloqueios,
  },
  {
    path: "/bloquearlista",
    name: "Bloquear Lista",
    component: BloquearLista,
  },
  {
    path: "/minhaslistasdebloqueios",
    name: "Minhas Listas",
    component: MinhasListasDeBloqueios,
  },
  {
    path: "/perguntas",
    name: "Perguntas e Respostas",
    component: Perguntas,
  },
  {
    path: "/assinaturas/plano-atual",
    name: "Plano Atual",
    component: AssinaturaVigente,
  },
  {
    path: "/assinaturas/planos",
    name: "Assinaturas",
    component: Assinaturas,
  },
  {
    path: "/assinaturas/historico",
    name: "Meu histórico de compras",
    component: HistoricoAssinatura,
  },
  {
    path: "/pagamento",
    name: "Pagamento",
    component: Pagamento,
  },
  {
    path: "/creditos/comprar",
    name: "Comprar Créditos",
    component: Creditos,
  },
  {
    path: "/creditos/extrato",
    name: "Extrato de Créditos",
    component: Extrato,
  },
  { path: "/processos", name: "Processos", component: Processos },
  { path: "/historico-replicacoes", name: "Histórico de Replicações", component: ReplicationsHistory },
  { path: "/admin", name: "Admin", component: Admin },
  {
    path: "/sair",
    name: "Entrar no Sistema",
    component: Logout,
  },
  {
    path: "/produtos/novo",
    name: "Novo Produto",
    component: ProductRegistration,
  },
  {
    path: "/produtos/cadastrados",
    name: "Produtos Cadastrados",
    component: RegisteredProducts,
  },
  {
    path: "/hospedagem-imagens",
    name: "Hospedagem de Imagens",
    component: ImagesStore,
  },
  {
    path: "/home",
    name: "Home",
    component: WelcomeScreen,
  },
  {
    path: "/armazem-padrao",
    name: "Armazém Padrão",
    component: WarehouseDefaults,
  },
  {
    path: "/estoque",
    name: "Estoque",
    component: Inventory,
  },
  {
    path: "/estoque/relatorios",
    name: "Relatórios de Estoque",
    component: InventoryReports,
  },
  {
    path: "/configuracoes/whatsapp",
    name: "Configurar Integração WhatsApp",
    component: WhatsAppConfig,
  },
  {
    path: "/anuncios/mercado-shops",
    name: "Mercado Shops",
    component: ListMercadoShops,
  },
  {
    path: "/anuncios/mercado-shops/atualizar-status-em-massa",
    name: "Atualizar Status em Massa",
    component: MShopsAtualizarStatusEmMassa,
  },
  {
    path: "/tabela-medidas",
    name: "Tabela de medidas",
    component: CatalogCharts,
  },
  {
    path: "/horarios-despacho",
    name: "Horários de despacho",
    component: ShippingSchedule,
  },
  {
    path: "/pesquisar-dados",
    name: "Pesquisar dados públicos",
    component: SearchPublicInfo,
  },
  {
    path: "/",
    name: "MeuML.com",
    component: () => <Redirect to="/home" />,
  },
  {
    path: "*",
    name: "404",
    component: () => <Redirect to="/home" />,
  },
];

export default routes;
