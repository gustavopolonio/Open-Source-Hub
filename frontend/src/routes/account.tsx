import React from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import type { GetProjectsResponse } from "./projects"; // @to-do: put type on @types files
import { ProjectCard } from "@/components/layout/ProjectCard";
import { ProjectCardSkeleton } from "@/components/layout/ProjectCardSkeleton";
import { UserSettingsCard } from "@/components/layout/UserSettingsCard";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    }): Promise<GetProjectsResponse> => {
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

  // @to-do: try to remove this api call by componentizing BookmarkProjectsList
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
    }): Promise<GetProjectsResponse> => {
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

  const loadedSubmittedProjectsCount = submittedProjectsData?.pages.reduce(
    (acc, currentPage) => {
      return acc + currentPage.projects.length;
    },
    0
  );

  const submittedProjectsTotalCount =
    submittedProjectsData?.pages[0].totalCount;

  const loadedBookmarkedProjectsCount = bookmarkedProjectsData?.pages.reduce(
    (acc, currentPage) => {
      return acc + currentPage.projects.length;
    },
    0
  );

  const bookmarkedProjectsTotalCount =
    bookmarkedProjectsData?.pages[0].totalCount;

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
            <div className="space-y-8">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
                {isSubmittedProjectsError ? (
                  <div className="col-span-full text-center text-destructive">
                    <Typography variant="p">
                      Failed to load projects :(
                    </Typography>
                  </div>
                ) : isSubmittedProjectsPending ? (
                  <>
                    <ProjectCardSkeleton />
                    <ProjectCardSkeleton />
                    <ProjectCardSkeleton />
                    <ProjectCardSkeleton />
                    <ProjectCardSkeleton />
                    <ProjectCardSkeleton />
                  </>
                ) : (
                  submittedProjectsData.pages.map((group, i) => (
                    <React.Fragment key={i}>
                      {group.projects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          id={project.id}
                          description={project.description}
                          gitHubRepoUrl={project.repoUrl}
                          gitHubStars={project.gitHubStars}
                          license={project.license}
                          liveLink={project.liveLink}
                          logoUrl={project.avatarUrl}
                          programmingLanguage={project.programmingLanguage}
                          title={project.name}
                          votes={project._count.votes}
                          tags={project.tags}
                          variant="editable"
                          isBookmarked={project.isBookmarked}
                          isVoted={project.isVoted}
                        />
                      ))}
                    </React.Fragment>
                  ))
                )}
              </div>

              <Typography className="text-center">
                Showing {loadedSubmittedProjectsCount} of{" "}
                {submittedProjectsTotalCount}
              </Typography>

              {submittedProjectsHasNextPage && !isSubmittedProjectsError && (
                <Button
                  className="font-bold flex mx-auto"
                  size="xlg"
                  variant="outline"
                  disabled={
                    isSubmittedProjectsPending ||
                    isFetchingSubmittedProjectsNextPage
                  }
                  onClick={() => fetchSubmittedProjectsNextPage()}
                >
                  {isFetchingSubmittedProjectsNextPage
                    ? "Loading ..."
                    : "Load more..."}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookmarked">
            <div className="space-y-8">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
                {isBookmarkedProjectsError ? (
                  <div className="col-span-full text-center text-destructive">
                    <Typography variant="p">
                      Failed to load projects :(
                    </Typography>
                  </div>
                ) : isBookmarkedProjectsPending ? (
                  <>
                    <ProjectCardSkeleton />
                    <ProjectCardSkeleton />
                    <ProjectCardSkeleton />
                    <ProjectCardSkeleton />
                    <ProjectCardSkeleton />
                    <ProjectCardSkeleton />
                  </>
                ) : (
                  bookmarkedProjectsData.pages.map((group, i) => (
                    <React.Fragment key={i}>
                      {group.projects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          id={project.id}
                          description={project.description}
                          gitHubRepoUrl={project.repoUrl}
                          gitHubStars={project.gitHubStars}
                          license={project.license}
                          liveLink={project.liveLink}
                          logoUrl={project.avatarUrl}
                          programmingLanguage={project.programmingLanguage}
                          title={project.name}
                          votes={project._count.votes}
                          tags={project.tags}
                          isBookmarked={project.isBookmarked}
                          isVoted={project.isVoted}
                        />
                      ))}
                    </React.Fragment>
                  ))
                )}
              </div>

              <Typography className="text-center">
                Showing {loadedBookmarkedProjectsCount} of{" "}
                {bookmarkedProjectsTotalCount}
              </Typography>

              {bookmarkedProjectsHasNextPage && !isBookmarkedProjectsError && (
                <Button
                  className="font-bold flex mx-auto"
                  size="xlg"
                  variant="outline"
                  disabled={
                    isBookmarkedProjectsPending ||
                    isFetchingBookmarkedProjectsNextPage
                  }
                  onClick={() => fetchBookmarkedProjectsNextPage()}
                >
                  {isFetchingBookmarkedProjectsNextPage
                    ? "Loading ..."
                    : "Load more..."}
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
