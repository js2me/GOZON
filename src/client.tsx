import './app/bootstrap/client';

const hydrateApp = async () => {
  const [reactDomClientModule, { App }, { Globals }] = await Promise.all([
    import('react-dom/client'),
    import('./app'),
    import('./globals'),
  ]);
  const hydrateRoot =
    reactDomClientModule.hydrateRoot ??
    (
      reactDomClientModule as {
        default?: { hydrateRoot?: typeof reactDomClientModule.hydrateRoot };
      }
    ).default?.hydrateRoot;

  const globals = Globals.fromSnapshot((globalThis as any).__SSR_DATA__);

  if (typeof hydrateRoot !== 'function') {
    throw new Error('hydrateRoot is not available in react-dom/client');
  }

  hydrateRoot(document.getElementById('root')!, <App globals={globals} />);
};

void hydrateApp();
