import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/layout/ProjectCard";
import { ProjectCardSkeleton } from "@/components/layout/ProjectCardSkeleton";
import { api } from "@/lib/axios";

type Tag = {
  name: string;
};

type Project = {
  id: number;
  name: string;
  description: string | null;
  repoUrl: string;
  gitHubStars: number;
  license: string | null;
  liveLink: string | null;
  avatarUrl: string | null;
  programmingLanguage: string | null;
  tags: Tag[];
  _count: {
    votes: number;
  };
};

type GetProjectsResponse = {
  nextPage: number | null;
  projects: Project[];
};

export const Route = createFileRoute("/")({
  component: Index,
});

async function getProjects({
  pageParam,
}: {
  pageParam: number;
}): Promise<GetProjectsResponse> {
  const response = await api.get(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/projects`,
    {
      params: {
        limit: 6,
        page: pageParam,
      },
    }
  );
  return response.data;
}

function Index() {
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  return (
    <div className="max-w-5xl mx-auto py-16 px-4 space-y-14">
      <div className="max-w-2xl mx-auto space-y-8">
        <Typography variant="h1" className="text-center">
          Contribute to open source projects
        </Typography>
        <Typography variant="p" className="text-center">
          Open Source Hub is a platform that connects developers with
          open-source opportunities effectively
        </Typography>
        <div className="flex justify-center gap-4">
          <Button className="font-bold" size="xlg" asChild>
            <Link to="/projects">Browse projects</Link>
          </Button>
          <Button className="font-bold" size="xlg" variant="secondary" asChild>
            <Link to="/projects/submit">Submit yours</Link>
          </Button>
        </div>
      </div>
      <div className="space-y-8">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
          {isError ? (
            <div className="col-span-full text-center text-destructive">
              <Typography variant="p">Failed to load projects :(</Typography>
            </div>
          ) : isPending ? (
            <>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </>
          ) : (
            data.pages.map((group, i) => (
              <React.Fragment key={i}>
                {group.projects.map((project) => (
                  <ProjectCard
                    key={project.id}
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
                  />
                ))}
              </React.Fragment>
            ))
          )}
        </div>
        {hasNextPage && !isError && (
          <Button
            className="font-bold flex mx-auto"
            size="xlg"
            variant="outline"
            disabled={isPending || isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? "Loading ..." : "Load more..."}
          </Button>
        )}
      </div>
      <div className="max-w-2xl mx-auto space-y-4">
        <Typography variant="h2" className="text-center mt-12">
          Open your code
        </Typography>
        <Typography variant="p" className="text-center">
          Every great contribution starts with an open repository. Share your
          project and collaborate with developers around the world.
        </Typography>
        <div className="flex justify-center gap-4">
          <Button className="font-bold" size="xlg">
            <Link to="/projects/submit">Submit your project</Link>
          </Button>
          <Button className="font-bold" size="xlg" variant="secondary" asChild>
            <Link to="/projects/submit">Explore all</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
