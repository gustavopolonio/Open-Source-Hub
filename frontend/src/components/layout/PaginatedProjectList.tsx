import { Fragment } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import { ProjectCardSkeleton } from "@/components/layout/ProjectCardSkeleton";
import { ProjectCard } from "@/components/layout/ProjectCard";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import type { PaginatedProjects } from "@/@types/project";

type PaginatedProjectListProps = {
  data: InfiniteData<PaginatedProjects> | undefined;
  isPending: boolean;
  isError: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  showCountInfo?: boolean;
  projectCardVariant?: "default" | "editable";
};

export function PaginatedProjectList({
  data: projectsData,
  isPending: isProjectsPending,
  isError: isProjectsError,
  fetchNextPage: fetchProjectsNextPage,
  hasNextPage: projectsHasNextPage,
  isFetchingNextPage: isProjectsFetchingNextPage,
  showCountInfo = true,
  projectCardVariant = "default",
}: PaginatedProjectListProps) {
  const loadedProjectsCount = projectsData?.pages.reduce((acc, currentPage) => {
    return acc + currentPage.projects.length;
  }, 0);

  const projectsTotalCount = projectsData?.pages[0].totalCount;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        {isProjectsError ? (
          <div className="col-span-full text-center text-destructive">
            <Typography variant="p">Failed to load projects :(</Typography>
          </div>
        ) : isProjectsPending ? (
          <>
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </>
        ) : (
          projectsData?.pages.map((group, i) => (
            <Fragment key={i}>
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
                  variant={projectCardVariant}
                />
              ))}
            </Fragment>
          ))
        )}
      </div>

      {showCountInfo && (
        <Typography className="text-center">
          Showing {loadedProjectsCount} of {projectsTotalCount}
        </Typography>
      )}

      {projectsHasNextPage && !isProjectsError && (
        <Button
          className="font-bold flex mx-auto"
          size="xlg"
          variant="outline"
          disabled={isProjectsPending || isProjectsFetchingNextPage}
          onClick={() => fetchProjectsNextPage()}
        >
          {isProjectsFetchingNextPage ? "Loading ..." : "Load more..."}
        </Button>
      )}
    </div>
  );
}
