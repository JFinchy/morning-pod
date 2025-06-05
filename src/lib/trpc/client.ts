import { createTRPCReact } from "@trpc/react-query";

import type { AppMockRouter } from "./root-mock";

export const api = createTRPCReact<AppMockRouter>();
