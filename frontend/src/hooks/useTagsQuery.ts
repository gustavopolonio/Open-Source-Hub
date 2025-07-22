import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Option } from "@/components/ui/multiple-selector";
import type { Tag } from "@/@types/project";

export function useTagsQuery() {
  const tagsQuery = useQuery({
    staleTime: 1000 * 60 * 60, // 1 hour
    queryKey: ["tags"],
    queryFn: async (): Promise<{ tags: Tag[] }> => {
      const response = await api.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/tags`
      );
      return response.data;
    },
  });

  const tagOptionsFormatted: Option[] =
    tagsQuery.data?.tags.map((tag) => ({
      label: tag.name,
      value: String(tag.id),
    })) ?? [];

  return {
    ...tagsQuery,
    tagOptionsFormatted,
  };
}
