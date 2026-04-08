export interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles?: string[];
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/medicamentos", label: "Medicamentos", icon: "medicamentos" },
  {
    href: "/fornecedores",
    label: "Fornecedores",
    icon: "fornecedores",
    roles: ["admin"],
  },
  { href: "/lotes", label: "Gestão de Estoque", icon: "lotes" },
  {
    href: "/eliminacoes",
    label: "Abates",
    icon: "eliminacoes",
    roles: ["admin"],
  },
  { href: "/movimentacoes", label: "Movimentações", icon: "movimentacoes" },
  {
    href: "/usuarios",
    label: "Gestão de Usuários",
    icon: "usuarios",
    roles: ["admin"],
  },
];

export const SETTINGS_NAV_ITEMS: NavItem[] = [
  { href: "/perfil", label: "O meu Perfil", icon: "perfil" },
];
