import { configure } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';
import { viewModelsConfig } from 'mobx-view-model';

configure({ enforceActions: 'never' });

viewModelsConfig.mode = 'ssr';

enableStaticRendering(typeof window === 'undefined');
