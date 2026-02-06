import { http } from "./http";

export async function login(email: string, password: string) {
  const res = await http.post("/auth/login", { email, password });
  return res.data;
}

export async function logout() {
  const res = await http.post("/auth/logout");
  return res.data;
}
