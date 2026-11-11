import type { NavigateFunction } from "react-router-dom";

let _navigate: NavigateFunction | null = null;

export function setNavigator(navigate: NavigateFunction) {
  _navigate = navigate;
}

export function getNavigator(): NavigateFunction {
  if (!_navigate) {
    throw new Error(
      "Navigator not initialized — call setNavigator(navigate) from a component first.",
    );
  }
  return _navigate;
}
