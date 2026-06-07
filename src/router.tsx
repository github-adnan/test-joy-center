import { QueryClient } from "@tanstack/react-query";
import { createHashHistory, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();
  const isApkBundle =
    typeof window !== "undefined" &&
    (window as Window & { __PPAY_APK__?: boolean }).__PPAY_APK__;
  const history = isApkBundle ? createHashHistory() : undefined;

  const router = createRouter({
    routeTree,
    ...(history ? { history } : {}),
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
