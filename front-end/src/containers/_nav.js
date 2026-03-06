import CIcon from "@coreui/icons-react";

let _nav = [
  {
    _tag: "CSidebarNavItem",
    name: "Início",
    to: "/home",
    icon: <CIcon name="cil-home" customClasses="c-sidebar-nav-icon" />,
  },
  {
    _tag: "CSidebarNavDropdown",
    name: "Contas",
    route: "/contas",
    icon: "cil-people",
    _children: [
      {
        _tag: "CSidebarNavItem",
        name: "Contas",
        to: "/contas",
        icon: "cil-people",
      },
      {
        _tag: "CSidebarNavItem",
        name: "Moderações",
        to: "/contas/moderacoes",
        icon: "cil-warning",
      },
    ],
  },
  {
    _tag: "CSidebarNavItem",
    name: "Perguntas",
    to: "/perguntas",
    icon: "cil-speech",
  },
  {
    _tag: "CSidebarNavTitle",
    _children: ["Mercado Livre"],
  },
  {
    _tag: "CSidebarNavDropdown",
    name: "Anúncios",
    icon: "cil-bullhorn",
    _children: [
      {
        _tag: "CSidebarNavItem",
        name: "Mercado Livre",
        to: "/anuncios",
        icon: "cil-bullhorn",
      },
      {
        _tag: "CSidebarNavItem",
        name: "Catálogo",
        to: "/catalogo",
        id: "catalogo",
        icon: "cil-book",
      },
      {
        _tag: "CSidebarNavItem",
        name: "Qualidade",
        to: "/qualidade-do-anuncio",
        icon: "cil-chart-line",
      },
      // {
      //   _tag: "CSidebarNavItem",
      //   name: "Replicar Anúncios",
      //   to: "/replicar-anuncios",
      //   icon: "cil-library-add",
      // },
      {
        _tag: "CSidebarNavItem",
        name: "Tabela de medidas",
        to: "/tabela-medidas",
        icon: "cil-list-rich",
      },
      {
        _tag: "CSidebarNavItem",
        name: "Modo Férias",
        to: "/modo-ferias",
        icon: "cil-beach-access",
      },
    ],
  },
  {
    _tag: "CSidebarNavDropdown",
    name: "Vendas",
    icon: "cil-graph",
    _children: [
      {
        _tag: "CSidebarNavItem",
        name: "Vendas",
        to: "/vendas",
        icon: "cil-graph",
      },
      {
        _tag: "CSidebarNavItem",
        name: "Etiquetas",
        to: "/vendas/etiquetas",
        icon: "cil-barcode",
      },
    ],
  },
  {
    _tag: "CSidebarNavDropdown",
    name: "Bloqueios",
    route: "/bloqueios",
    icon: "cil-lock-locked",
    _children: [
      {
        _tag: "CSidebarNavItem",
        name: "Bloquear Comprador",
        to: "/bloquearcomprador",
        icon: "cil-user-unfollow",
      },
      {
        _tag: "CSidebarNavItem",
        name: "Meus Bloqueios",
        to: "/meusbloqueios",
        icon: "cil-lock-locked",
      },
      {
        _tag: "CSidebarNavItem",
        name: "Bloquear em massa",
        to: "/bloquearemmassa",
        icon: "cil-people",
      },
      {
        _tag: "CSidebarNavItem",
        name: "Bloquear Lista",
        to: "/bloquearlista",
        icon: "cil-x-circle",
      },
      {
        _tag: "CSidebarNavItem",
        name: "Minhas Listas",
        to: "/minhaslistasdebloqueios",
        icon: "cil-list",
      },
    ],
  },
  {
    _tag: "CSidebarNavItem",
    name: "Informações públicas",
    to: "/pesquisar-dados",
    icon: "cil-search",
  },
  {
    _tag: "CSidebarNavItem",
    name: "Horários de despacho",
    to: "/horarios-despacho",
    icon: "cil-truck",
  },
  {
    _tag: "CSidebarNavItem",
    name: "Novidades",
    to: "/novidades",
    icon: "cil-bell",
  },
  {
    _tag: "CSidebarNavTitle",
    _children: ["Shopee"],
  },
  {
    _tag: "CSidebarNavItem",
    name: "Anúncios",
    to: "/anuncios-shopee",
    icon: "cil-bullhorn",
  },
  {
    _tag: "CSidebarNavTitle",
    _children: ["Outros"],
  },
  {
    _tag: "CSidebarNavDropdown",
    name: "Assinatura",
    to: "/assinaturas",
    icon: "cil-pencil",
    _children: [
      {
        _tag: "CSidebarNavItem",
        name: "Plano Atual",
        to: "/assinaturas/plano-atual",
        icon: "cil-bookmark",
      },
      {
        _tag: "CSidebarNavItem",
        name: "Assinar",
        to: "/assinaturas/planos",
        icon: "cil-pencil",
      },
      {
        _tag: "CSidebarNavItem",
        name: "Histórico",
        to: "/assinaturas/historico",
        icon: "cil-calendar",
      },
    ],
  },
  {
    _tag: "CSidebarNavDropdown",
    name: "Créditos",
    route: "/creditos",
    icon: "cil-credit-card",
    _children: [
      {
        _tag: "CSidebarNavItem",
        name: "Comprar",
        to: "/creditos/comprar",
        icon: "cil-wallet",
      },
    ],
  },
  {
    _tag: "CSidebarNavItem",
    name: "Processos",
    to: "/processos",
    icon: "cil-justify-left",
  },
  {
    _tag: "CSidebarNavItem",
    name: "Histórico de Replicações",
    to: "/historico-replicacoes",
    icon: "cil-history",
  },
  {
    _tag: "CSidebarNavDropdown",
    name: "Configurações",
    icon: "cil-settings",
    _children: [
      {
        _tag: "CSidebarNavItem",
        name: "Integração WhatsApp",
        to: "/configuracoes/whatsapp",
        icon: "cib-whatsapp",
      },
    ],
  },
  {
    _tag: "CSidebarNavItem",
    name: "Sair",
    to: "/sair",
    icon: "cil-account-logout",
  },
];

if (localStorage.getItem("is_admin")) {
  const MLIpWhitelist = {
    _tag: "CSidebarNavItem",
    name: "Mercado Livre IPs whitelist",
    to: "/configuracoes/ip",
    icon: "cil-warning",
  };
  _nav = _nav.reduce((previous, current) => {
    switch (current.name) {
      case "Configurações":
        return [...previous, { ...current, _children: [...current._children, MLIpWhitelist] }];

      default:
        return [...previous, current];
    }
  }, []);
}

export default _nav;
