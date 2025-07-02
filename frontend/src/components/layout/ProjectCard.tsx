import { Typography } from "../ui/typography";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import type { GetProjectsResponse } from "@/routes";
import { useAuth } from "@/hooks/useAuth";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

type Tag = {
  name: string;
};

type ProjectCardProps = {
  id: number;
  logoUrl: string | null;
  title: string;
  license: string | null;
  description: string | null;
  liveLink: string | null;
  gitHubStars: number;
  votes: number;
  programmingLanguage: string | null;
  gitHubRepoUrl: string;
  isBookmarked?: boolean;
  isVoted?: boolean;
  tags: Tag[];
};

export function ProjectCard({
  id,
  description,
  gitHubStars,
  license,
  liveLink,
  logoUrl,
  programmingLanguage,
  title,
  votes,
  gitHubRepoUrl,
  tags,
  isBookmarked,
  isVoted,
}: ProjectCardProps) {
  const { isAuthenticated } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  async function handleBookmarkToggle() {
    return await axiosPrivate({
      url: `${import.meta.env.VITE_BACKEND_BASE_URL}/projects/${id}/bookmark`,
      method: isBookmarked ? "DELETE" : "POST",
    });
  }

  const toggleBookmarkMutation = useMutation({
    mutationFn: handleBookmarkToggle,
    onSuccess() {
      function updateBookmarksData(
        oldData: InfiniteData<GetProjectsResponse> | undefined
      ) {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            projects: page.projects.map((project) => {
              if (project.id === id) {
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

      queryClient.setQueryData<InfiniteData<GetProjectsResponse>>(
        ["projects"],
        (oldData) => updateBookmarksData(oldData)
      );

      const filteredQueries = queryClient.getQueriesData<
        InfiniteData<GetProjectsResponse>
      >({
        queryKey: ["filtered-projects"],
        exact: false,
      });

      for (const [queryKey, data] of filteredQueries) {
        queryClient.setQueryData(queryKey, updateBookmarksData(data));
      }
      // @to-do: add success toast component
    },
    onError() {
      // @to-do: add failed toast component
      alert("Failed to update bookmard. Please try again.");
    },
  });

  async function handleVoteToggle() {
    return await axiosPrivate({
      url: `${import.meta.env.VITE_BACKEND_BASE_URL}/projects/${id}/vote`,
      method: isVoted ? "DELETE" : "POST",
    });
  }

  const toggleVoteMutation = useMutation({
    mutationFn: handleVoteToggle,
    onMutate() {
      return { wasVoted: isVoted };
    },
    onSuccess(_data, _variables, context) {
      function updateVotesData(
        oldData: InfiniteData<GetProjectsResponse> | undefined
      ) {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            projects: page.projects.map((project) => {
              if (project.id === id) {
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

      queryClient.setQueryData<InfiniteData<GetProjectsResponse>>(
        ["projects"],
        (oldData) => updateVotesData(oldData)
      );

      const filteredQueries = queryClient.getQueriesData<
        InfiniteData<GetProjectsResponse>
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

  return (
    <div className="relative rounded-xl shadow-sm hover:shadow-[var(--shadow-xl)]">
      <a href={gitHubRepoUrl} target="_blank" className="absolute inset-0" />
      <Card className="transition-transform duration-200 gap-3 h-full">
        <CardHeader className="grid-cols-[auto_1fr_auto]!">
          <img
            src={logoUrl || "https://github.com/evilrabbit.png"}
            alt={title}
            className="w-12 h-auto rounded-sm"
          />
          <div className="min-h-[52px] flex flex-col justify-center gap-1">
            <CardTitle className="line-clamp-2 break-all">{title}</CardTitle>
            <CardDescription className="line-clamp-1">
              {license || "No license"}
            </CardDescription>
          </div>
          <CardAction className="col-start-3 flex items-center gap-2.5 ml-2">
            <Tooltip>
              <TooltipTrigger className="z-10 w-5 h-5 rounded-full border-2 border-[var(--primary)] bg-[var(--secondary)]"></TooltipTrigger>
              <TooltipContent className="py-2.5">
                <p className="flex gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag.name} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </p>
              </TooltipContent>
            </Tooltip>
            {isAuthenticated && (
              <Tooltip>
                <TooltipTrigger
                  className="z-10"
                  onClick={() => toggleBookmarkMutation.mutate()}
                >
                  <Icon
                    name="bookmark"
                    outlineColor="primary"
                    fill={isBookmarked ? "primary" : "transparent"}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </TooltipContent>
              </Tooltip>
            )}
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-2">
          <Typography variant="p" className="line-clamp-2 min-h-10">
            {description}
          </Typography>
          {liveLink ? (
            <Button
              variant="link"
              className="p-0 line-clamp-1 relative z-10"
              asChild
            >
              <a href={liveLink} target="_blank">
                {liveLink}
              </a>
            </Button>
          ) : (
            <Typography
              variant="p"
              className="h-9 m-0! text-[var(--primary)] flex items-center text-sm"
            >
              No live link provided
            </Typography>
          )}
        </CardContent>
        <CardFooter className="flex gap-4">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger className="z-10">
                <Icon
                  name="star"
                  outlineColor="oklch(90.5% 0.182 98.111)"
                  fill="oklch(90.5% 0.182 98.111)"
                />
              </TooltipTrigger>
              <TooltipContent>GitHub stars</TooltipContent>
            </Tooltip>
            {gitHubStars}
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                className="z-10"
                onClick={() => {
                  if (isAuthenticated) toggleVoteMutation.mutate();
                }}
              >
                <Icon
                  name="triangle"
                  outlineColor="oklch(54.6% 0.245 262.881)"
                  fill={
                    isAuthenticated
                      ? isVoted
                        ? "oklch(54.6% 0.245 262.881)"
                        : "transparent"
                      : "oklch(54.6% 0.245 262.881)"
                  }
                />
              </TooltipTrigger>
              <TooltipContent>
                {isAuthenticated ? (isVoted ? "Unvote" : "Upvote") : "Upvotes"}
              </TooltipContent>
            </Tooltip>
            {votes}
          </div>
          {programmingLanguage && (
            <Badge variant="secondary" className="ml-auto">
              {programmingLanguage}
            </Badge>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
