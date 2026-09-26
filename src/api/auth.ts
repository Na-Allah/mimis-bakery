const API_BASE_URL = "http://10.133.29.175:8000/api";

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone_number: string;
  delivery_address: string;
  password: string;
}

function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

async function ensureCsrfToken(): Promise<string> {
  const existingToken = getCookie("csrftoken");

  if (existingToken) {
    return existingToken;
  }

  const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to initialize authentication.");
  }

  const data = await response.json();

  return data.csrfToken;
}

export async function registerUser(payload: RegisterPayload) {
  const csrfToken = await ensureCsrfToken();

  const response = await fetch(`${API_BASE_URL}/auth/register/`, {
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

  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
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
  const response = await fetch(`${API_BASE_URL}/auth/me/`, {
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

export async function logoutUser() {
  const csrfToken = await ensureCsrfToken();

  const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      data.detail || "Unable to log out."
    );
  }

  return true;
}