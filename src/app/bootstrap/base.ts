import { configure } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';
import { viewModelsConfig } from 'mobx-view-model';

configure({ enforceActions: 'never' });

viewModelsConfig.mode = typeof window === 'undefined' ? 'ssr' : 'csr';

enableStaticRendering(typeof window === 'undefined');
