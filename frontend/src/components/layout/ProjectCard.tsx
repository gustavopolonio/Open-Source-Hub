import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/axios";
import type { GetTagsResponse } from "@/routes/projects";
import type { GetProjectsResponse } from "@/routes";
import { useAuth } from "@/hooks/useAuth";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import MultipleSelector from "@/components/ui/multiple-selector";
import type { Option } from "@/components/ui/multiple-selector";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Tag = {
  id: number;
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
  variant?: "default" | "editable";
  isVoted?: boolean;
  tags: Tag[];
};

type UpdateProjectRequestBody = {
  liveLink: string;
  tagIds: number[];
};

type UpdateProjectResponse = {
  updatedProject: {
    liveLink: string;
    tags: Tag[];
  };
};

const tagOptionsSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

const updateProjectFormSchema = z.object({
  tagOptions: z.array(tagOptionsSchema),
  liveLink: z.string().url(),
});

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
  variant = "default",
  isBookmarked,
  isVoted,
}: ProjectCardProps) {
  const { isAuthenticated } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [isUpdateProjectModalOpen, setIsUpdateProjectModalOpen] =
    useState(false);

  const {
    data: tagsData,
    isError: isTagsError,
    isPending: isTagsPending,
  } = useQuery({
    staleTime: 1000 * 60 * 60, // 1 hour
    queryKey: ["tags"],
    queryFn: async (): Promise<GetTagsResponse> => {
      const response = await api.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/tags`
      );
      return response.data;
    },
  });

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

      queryClient.setQueryData<InfiniteData<GetProjectsResponse>>(
        ["submitted-projects"],
        (oldData) => updateVotesData(oldData)
      );

      // @to-do: add success toast component
    },
    onError() {
      // @to-do: add failed toast component
      alert("Failed to update vote. Please try again.");
    },
  });

  const updateProjectForm = useForm<z.infer<typeof updateProjectFormSchema>>({
    resolver: zodResolver(updateProjectFormSchema),
    defaultValues: {
      tagOptions: tags.map((tag) => ({
        label: tag.name,
        value: String(tag.id),
      })),
      liveLink: liveLink || "",
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (projectData: UpdateProjectRequestBody) => {
      const response = await axiosPrivate.patch(`/projects/${id}`, projectData);
      return response.data;
    },
    onSuccess(data: UpdateProjectResponse) {
      function updateProjectData(
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
                  liveLink: data.updatedProject.liveLink,
                  tags: data.updatedProject.tags,
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
        (oldData) => updateProjectData(oldData)
      );

      const filteredQueries = queryClient.getQueriesData<
        InfiniteData<GetProjectsResponse>
      >({
        queryKey: ["filtered-projects"],
        exact: false,
      });

      for (const [queryKey, data] of filteredQueries) {
        // @to-do: when user votes on page /projects the oerder of 'Most voted' doesnt change, because it's cached. Check this
        queryClient.setQueryData(queryKey, updateProjectData(data));
      }

      queryClient.setQueryData<InfiniteData<GetProjectsResponse>>(
        ["submitted-projects"],
        (oldData) => updateProjectData(oldData)
      );

      // @to-do: add success toast component
      alert("Project updated!");
      setIsUpdateProjectModalOpen(false);
    },
    onError() {
      // @to-do: add failed toast component
      alert("Failed to update project");
    },
  });

  function onUpdateProject(values: z.infer<typeof updateProjectFormSchema>) {
    const { liveLink, tagOptions } = values;
    const tagIds = tagOptions.map((tag) => Number(tag.value));
    updateProjectMutation.mutate({
      liveLink,
      tagIds,
    });
  }

  const tagOptions: Option[] =
    tagsData?.tags.map((tag) => ({
      label: tag.name,
      value: String(tag.id),
    })) ?? [];

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

            {isAuthenticated && variant === "default" && (
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

            {isAuthenticated && variant === "editable" && (
              <Dialog
                open={isUpdateProjectModalOpen}
                onOpenChange={(open) => {
                  setIsUpdateProjectModalOpen(open);
                  if (!open) {
                    setTimeout(() => {
                      updateProjectForm.reset({
                        tagOptions: tags.map((tag) => ({
                          label: tag.name,
                          value: String(tag.id),
                        })),
                        liveLink: liveLink || "",
                      });
                    }, 350);
                  }
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild className="z-10">
                    <DialogTrigger asChild>
                      <Icon name="edit" outlineColor="#000" />
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Edit project</TooltipContent>
                </Tooltip>
                <DialogContent>
                  <Form {...updateProjectForm}>
                    <form
                      onSubmit={updateProjectForm.handleSubmit(onUpdateProject)}
                      className="grid gap-4"
                    >
                      <DialogHeader>
                        <DialogTitle>Edit project</DialogTitle>
                        <DialogDescription>
                          Make changes to your project here. Click save when
                          you&apos;re done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <FormField
                          control={updateProjectForm.control}
                          name="liveLink"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>Live link</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {isTagsPending ? (
                          // @to-do: check if this message ui is right
                          <Typography variant="p">Loading tags...</Typography>
                        ) : isTagsError ? (
                          // @to-do: check if this message ui is right
                          <Typography variant="p">
                            Failed to load tags.
                          </Typography>
                        ) : (
                          <FormField
                            control={updateProjectForm.control}
                            name="tagOptions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tags</FormLabel>
                                <FormControl>
                                  <MultipleSelector
                                    defaultOptions={tagOptions}
                                    placeholder="Select tags to the project..."
                                    emptyIndicator={
                                      <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                        no results found.
                                      </p>
                                    }
                                    hidePlaceholderWhenSelected
                                    startIcon={
                                      <Icon
                                        name="settings2"
                                        size="md"
                                        outlineColor="oklch(0.5032 0 0)"
                                      />
                                    }
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          disabled={updateProjectMutation.isPending}
                          type="submit"
                        >
                          {updateProjectMutation.isPending
                            ? "Saving..."
                            : "Save changes"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
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
