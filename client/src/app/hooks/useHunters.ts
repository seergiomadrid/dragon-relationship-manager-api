import { useQuery } from "@tanstack/react-query";
import { getHunters } from "../../api/users";

export function useHunters(enabled: boolean) {
  return useQuery({
    queryKey: ["hunters"],
    queryFn: getHunters,
    enabled,
    staleTime: 60_000,
    retry: false,
  });
}
