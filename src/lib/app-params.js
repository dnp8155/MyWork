import { supabase } from '@/api/supabaseClient';

const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
	!isNode && new URLSearchParams(window.location.search).get("clear_access_token") === 'true';

const clearStoredAccessToken = async () => {
	await supabase.auth.signOut();
}

const getAppParams = () => {
	if (isClearAccessTokenRequested()) {
		clearStoredAccessToken();
	}
	// With Supabase, we don't need to manually read the token synchronously.
	// Supabase manages the session automatically.
	return {
		appId: import.meta.env.VITE_SUPABASE_URL,
		token: 'supabase-handled',
	}
}

export const appParams = {
	...getAppParams()
}
