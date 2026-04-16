// В dev без index.html Vite не вызывает transformIndexHtml — нужен preamble для Fast Refresh

import { app } from '../app';

// (см. getPreambleCode в @vitejs/plugin-react). Иначе: "can't detect preamble".
export const REACT_REFRESH_PREAMBLE = app.isDev
  ? `<script type="module">
  import { injectIntoGlobalHook } from "/@react-refresh";
  injectIntoGlobalHook(window);
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;
</script>
`
  : '';
