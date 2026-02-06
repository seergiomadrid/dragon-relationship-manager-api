import { http } from "./http";

export type Dragon = {
  id: string;
  name: string;
  speciesType: string;
  aggression: number;
  state: "ASSIGNED" | "IN_PROGRESS" | "AT_RISK" | "CLOSED";
  ownerHunterId?: string | null;
  lastEncounterAt?: string | null;
};

export async function getDragons(): Promise<Dragon[]> {
  const res = await http.get("/dragons");
  return res.data;
}
