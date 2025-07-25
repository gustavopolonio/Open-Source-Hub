import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import type { PaginatedProjects } from "@/@types/project";

export function useToggleVoteMutation(projectId: number, isVoted: boolean) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  async function handleVoteToggle() {
    return await axiosPrivate({
      url: `${import.meta.env.VITE_BACKEND_BASE_URL}/projects/${projectId}/vote`,
      method: isVoted ? "DELETE" : "POST",
    });
  }

  return useMutation({
    mutationFn: handleVoteToggle,
    onMutate() {
      return { wasVoted: isVoted };
    },
    onSuccess(_data, _variables, context) {
      function updateVotesData(
        oldData: InfiniteData<PaginatedProjects> | undefined
      ) {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            projects: page.projects.map((project) => {
              if (project.id === projectId) {
                const currentVotes = project.votesCount;
                const newVotesCount = context.wasVoted
                  ? Math.max(currentVotes - 1, 0)
                  : currentVotes + 1;

                return {
                  ...project,
                  isVoted: !isVoted,
                  votesCount: newVotesCount,
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
        (oldData) => updateVotesData(oldData)
      );

      queryClient.setQueryData<InfiniteData<PaginatedProjects>>(
        ["bookmarked-projects"],
        (oldData) => updateVotesData(oldData)
      );

      queryClient.setQueryData<InfiniteData<PaginatedProjects>>(
        ["submitted-projects"],
        (oldData) => updateVotesData(oldData)
      );

      const filteredQueries = queryClient.getQueriesData<
        InfiniteData<PaginatedProjects>
      >({
        queryKey: ["filtered-projects"],
        exact: false,
      });

      for (const [queryKey, data] of filteredQueries) {
        queryClient.setQueryData(queryKey, updateVotesData(data));
      }

      toast.success(`Project ${isVoted ? "un" : "up"}voted`);
    },
    onError() {
      toast.error("Failed to update vote. Please try again");
    },
  });
}
