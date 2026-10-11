import { API_URL, getCsrfToken } from './clients';

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone_number: string;
  delivery_address: string;
  password: string;
}

async function ensureCsrfToken(): Promise<string> {
  const token = await getCsrfToken();
  if (!token) throw new Error("Unable to initialize authentication.");
  return token;
}

export async function registerUser(payload: RegisterPayload) {
  const csrfToken = await ensureCsrfToken();

  const response = await fetch(`${API_URL}/auth/register/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        Object.values(data).flat().join(" ") ||
        "Failed to create account."
    );
  }

  return data;
}

export async function loginUser(email: string, password: string) {
  const csrfToken = await ensureCsrfToken();

  const response = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Invalid email or password.");
  }

  return data;
}

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/auth/me/`, {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unable to retrieve current user.");
  }

  return data;
}

export async function updateCurrentUserProfile(payload: {
  full_name: string;
  phone_number: string;
}) {
  const csrfToken = await ensureCsrfToken();
  const response = await fetch(`${API_URL}/auth/me/`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.detail ||
        Object.values(data).flat().join(" ") ||
        "Unable to update your profile."
    );
  }
  return data;
}

export async function forgotPasswordUser(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('Please enter your email address.');
  }

  const csrfToken = await ensureCsrfToken();

  const response = await fetch(`${API_URL}/auth/forgot-password/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
    },
    body: JSON.stringify({ email: normalizedEmail }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.message ||
        Object.values(data).flat().join(' ') ||
        'Unable to send reset instructions.'
    );
  }

  return data;
}

export const requestPasswordReset = forgotPasswordUser;

export async function logoutUser() {
  const token = await getCsrfToken();
  const res = await fetch(`${API_URL}/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-CSRFToken': token } : {}),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data.detail ||
        data.message ||
        `Logout failed (HTTP ${res.status}).`
    );
  }
}