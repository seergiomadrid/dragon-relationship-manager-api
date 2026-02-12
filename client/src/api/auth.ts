import { api } from "../lib/api";
import { http } from "./http";

export type Me = { id: string; email: string; role: "ADMIN" | "HUNTER" };

export async function login(email: string, password: string) {
  const res = await http.post("/auth/login", { email, password });
  return res.data;
}

export async function logout() {
  const res = await http.post("/auth/logout");
  return res.data;
}
export async function getMe() {
  return api<Me>("/auth/me");
}
