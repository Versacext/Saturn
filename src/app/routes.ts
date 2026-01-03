import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  // Убираем "app/", так как мы уже находимся внутри этой папки согласно конфигу
  index("page.jsx"),

  // Страница 404
  route("*", "__create/not-found.tsx"),
] satisfies RouteConfig;