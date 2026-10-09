import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { supabaseEntities } from '@/lib/supabaseEntities';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const _base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  appBaseUrl
});

// Route all entity CRUD to Supabase; fall back to Base44 for built-in entities (e.g. User)
const entitiesProxy = new Proxy(supabaseEntities, {
  get(target, prop) {
    if (prop in target) return target[prop];
    return _base44.entities[prop];
  }
});

export const base44 = new Proxy(_base44, {
  get(target, prop) {
    if (prop === 'entities') return entitiesProxy;
    return target[prop];
  }
});