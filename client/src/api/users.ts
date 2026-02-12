import { api } from "../lib/api";

export type UserLite = {
  id: string;
  email: string;
  role: "ADMIN" | "HUNTER";
};

export async function getHunters() {
  return api<UserLite[]>("/users?role=HUNTER");
}
