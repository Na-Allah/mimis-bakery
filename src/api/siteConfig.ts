import type { SiteConfiguration } from '../types';
import { API_URL, getCsrfToken } from './clients';

export async function fetchSiteConfig(): Promise<SiteConfiguration> {
  const res = await fetch(`${API_URL}/site-config/`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to load site settings (${res.status})`);
  const data = await res.json();
  return { ...data, logo: data.logo ?? '' };
}

export async function saveSiteConfig(
  config: Partial<SiteConfiguration>,
  logoFile?: File | null,
): Promise<SiteConfiguration> {
  const token = await getCsrfToken();
  let headers: HeadersInit = token ? { 'X-CSRFToken': token } : {};
  let body: BodyInit;

  if (logoFile) {
    const formData = new FormData();
    Object.entries(config).forEach(([key, value]) => {
      if (key !== 'logo' && value !== undefined) formData.set(key, String(value));
    });
    formData.set('logo', logoFile);
    body = formData;
  } else {
    headers = { ...headers, 'Content-Type': 'application/json' };
    const { logo: _logo, ...fields } = config;
    body = JSON.stringify(fields);
  }

  const res = await fetch(`${API_URL}/site-config/`, {
    method: 'PATCH',
    credentials: 'include',
    headers,
    body,
  });

  if (!res.ok) {
    let message = `Could not save settings (${res.status})`;
    try {
      const data = await res.json();
      message = data.detail ?? Object.values(data).flat().join(' ');
    } catch {
      /* keep the default message */
    }
    throw new Error(message);
  }
  const data = await res.json();
  return { ...data, logo: data.logo ?? '' };
}