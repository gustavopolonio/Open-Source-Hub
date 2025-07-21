import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
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
                const currentVotes = project._count.votes;
                const newVotesCount = context.wasVoted
                  ? Math.max(currentVotes - 1, 0)
                  : currentVotes + 1;

                return {
                  ...project,
                  isVoted: !isVoted,
                  _count: {
                    ...project._count,
                    votes: newVotesCount,
                  },
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
        // @to-do: when user votes on page /projects the oerder of 'Most voted' doesnt change, because it's cached. Check this
        queryClient.setQueryData(queryKey, updateVotesData(data));
      }

      // @to-do: add success toast component
    },
    onError() {
      // @to-do: add failed toast component
      alert("Failed to update vote. Please try again.");
    },
  });
}
