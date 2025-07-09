import { createFileRoute, redirect } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { UserSettingsCard } from "@/components/layout/UserSettingsCard";
import { PaginatedProjectList } from "@/components/layout/PaginatedProjectList";
import { Typography } from "@/components/ui/typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PaginatedProjects } from "@/@types/project";

export const Route = createFileRoute("/account")({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: Account,
});

function Account() {
  const axiosPrivate = useAxiosPrivate();

  // @to-do: transform infiniteQuery calls in a hook?
  const {
    data: submittedProjectsData,
    isPending: isSubmittedProjectsPending,
    isError: isSubmittedProjectsError,
    fetchNextPage: fetchSubmittedProjectsNextPage,
    hasNextPage: submittedProjectsHasNextPage,
    isFetchingNextPage: isFetchingSubmittedProjectsNextPage,
  } = useInfiniteQuery({
    staleTime: 1000 * 60 * 60, // 1 hour
    queryKey: ["submitted-projects"],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<PaginatedProjects> => {
      const response = await axiosPrivate.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/users/me/projects`,
        {
          params: {
            limit: 6,
            page: pageParam,
          },
        }
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const {
    data: bookmarkedProjectsData,
    isPending: isBookmarkedProjectsPending,
    isError: isBookmarkedProjectsError,
    fetchNextPage: fetchBookmarkedProjectsNextPage,
    hasNextPage: bookmarkedProjectsHasNextPage,
    isFetchingNextPage: isFetchingBookmarkedProjectsNextPage,
  } = useInfiniteQuery({
    queryKey: ["bookmarked-projects"],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<PaginatedProjects> => {
      const response = await axiosPrivate.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/users/me/bookmarks`,
        {
          params: {
            limit: 6,
            page: pageParam,
          },
        }
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  return (
    <div className="max-w-5xl mx-auto py-16 px-4 space-y-14">
      <div className="max-w-2xl mx-auto space-y-14">
        <Typography variant="h1" className="text-center">
          Account settings
        </Typography>

        <UserSettingsCard />
      </div>

      <div className="space-y-8">
        <Typography variant="h2" className="text-center">
          Projects
        </Typography>

        <Tabs defaultValue="submitted">
          <TabsList className="w-full">
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          </TabsList>

          <TabsContent value="submitted">
            <PaginatedProjectList
              data={submittedProjectsData}
              isPending={isSubmittedProjectsPending}
              isError={isSubmittedProjectsError}
              fetchNextPage={fetchSubmittedProjectsNextPage}
              hasNextPage={submittedProjectsHasNextPage}
              isFetchingNextPage={isFetchingSubmittedProjectsNextPage}
              projectCardVariant="editable"
            />
          </TabsContent>

          <TabsContent value="bookmarked">
            <PaginatedProjectList
              data={bookmarkedProjectsData}
              isPending={isBookmarkedProjectsPending}
              isError={isBookmarkedProjectsError}
              fetchNextPage={fetchBookmarkedProjectsNextPage}
              hasNextPage={bookmarkedProjectsHasNextPage}
              isFetchingNextPage={isFetchingBookmarkedProjectsNextPage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
