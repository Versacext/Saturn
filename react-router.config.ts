import type { Config } from "@react-router/dev/config";

export default {
  // Это отключит серверный рендеринг и создаст index.html
  ssr: false,
  appDirectory: "src/app",
} satisfies Config;