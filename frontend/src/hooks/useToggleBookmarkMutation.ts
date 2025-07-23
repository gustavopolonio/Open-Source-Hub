import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import type { PaginatedProjects } from "@/@types/project";

export function useToggleBookmarkMutation(
  projectId: number,
  isBookmarked: boolean
) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  async function handleBookmarkToggle() {
    return await axiosPrivate({
      url: `${import.meta.env.VITE_BACKEND_BASE_URL}/projects/${projectId}/bookmark`,
      method: isBookmarked ? "DELETE" : "POST",
    });
  }

  return useMutation({
    mutationFn: handleBookmarkToggle,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["bookmarked-projects"] });

      function updateBookmarksData(
        oldData: InfiniteData<PaginatedProjects> | undefined
      ) {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            projects: page.projects.map((project) => {
              if (project.id === projectId) {
                return {
                  ...project,
                  isBookmarked: !isBookmarked,
                };
              } else {
                return project;
              }
            }),
          })),
        };
      }

      queryClient.setQueryData<InfiniteData<PaginatedProjects>>(
        ["projects"],
        (oldData) => updateBookmarksData(oldData)
      );

      const filteredQueries = queryClient.getQueriesData<
        InfiniteData<PaginatedProjects>
      >({
        queryKey: ["filtered-projects"],
        exact: false,
      });

      for (const [queryKey, data] of filteredQueries) {
        queryClient.setQueryData(queryKey, updateBookmarksData(data));
      }

      toast.success(`Project ${isBookmarked ? "un" : ""}bookmarked`);
    },
    onError() {
      toast.error("Failed to update bookmark. Please try again");
    },
  });
}
