import { getFixedRangeValues } from "@/lib/data";

export const GET = async () => {
  const data = await getFixedRangeValues();
  return Response.json(data);
};
