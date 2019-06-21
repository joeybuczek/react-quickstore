import React, { useContext } from "react";
import { QuickStoreContext } from "./QuickStore";
export { Provider, Consumer } from "./QuickStore";
export const useQuickStore = () => useContext(QuickStoreContext);
