import { getNumberRange } from "@/lib/data";

export const GET = async () => {
  const data = await getNumberRange();
  return Response.json(data);
};
