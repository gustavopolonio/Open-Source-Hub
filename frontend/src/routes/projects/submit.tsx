import type { AxiosError } from "axios";
import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings2, CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/axios";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import MultipleSelector from "@/components/ui/multiple-selector";
import type { Option } from "@/components/ui/multiple-selector";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// @to-do: these types are the same as index.tsx types. Fix it
type Tag = {
  id: number;
  name: string;
};

type GetTagsResponse = {
  tags: Tag[];
};

type GitHubRepository = {
  name: string;
  url: string;
};

type GetAuthUserGithubRepos = {
  gitHubRepositories: GitHubRepository[];
};

type CreateProjectRequestBody = {
  repoUrl: string;
  tagIds: number[];
};

export const Route = createFileRoute("/projects/submit")({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: SubmitProject,
});

const tagOptionsSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

const submitProjectFormSchema = z.object({
  tagOptions: z.array(tagOptionsSchema),
  repositoryUrl: z
    .string({
      required_error: "Please select a repository.",
    })
    .url(),
});

function SubmitProject() {
  const axiosPrivate = useAxiosPrivate();
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const queryClient = useQueryClient();

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

  const {
    data: reposData,
    isError: isReposError,
    isPending: isReposPending,
  } = useQuery({
    queryKey: ["auth-user-github-repos"],
    queryFn: async (): Promise<GetAuthUserGithubRepos> => {
      const response = await axiosPrivate.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/github/user/repos`
      );
      return response.data;
    },
  });

  const submitProjectForm = useForm<z.infer<typeof submitProjectFormSchema>>({
    resolver: zodResolver(submitProjectFormSchema),
    defaultValues: {
      tagOptions: [],
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (newProject: CreateProjectRequestBody) => {
      const response = await axiosPrivate.post("/projects", newProject);
      return response.data;
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["submitted-projects"] });
      queryClient.invalidateQueries({ queryKey: ["filtered-projects"] });

      // @to-do: add success toast component
      alert("Project submitted!");
      submitProjectForm.reset();
    },
    onError(error: AxiosError) {
      // @to-do: add failed toast component
      if (error.status === 409) {
        alert("Failed to submit project: project already submitted");
        return;
      }

      alert("Failed to submit project");
    },
  });

  function onCreateProject(values: z.infer<typeof submitProjectFormSchema>) {
    const { repositoryUrl, tagOptions } = values;
    const tagIds = tagOptions.map((tag) => Number(tag.value));
    createProjectMutation.mutate({ repoUrl: repositoryUrl, tagIds });
  }

  const tagOptions: Option[] =
    tagsData?.tags.map((tag) => ({
      label: tag.name,
      value: String(tag.id),
    })) ?? [];

  return (
    <div className="max-w-5xl mx-auto py-16 px-4 space-y-14">
      <div className="max-w-2xl mx-auto space-y-14">
        <div className="space-y-8">
          <Typography variant="h1" className="text-center">
            Submit your project
          </Typography>
          <Typography className="text-center">
            Find passionate programmers to help you with your idea
          </Typography>
        </div>

        <Form {...submitProjectForm}>
          <form
            className="space-y-2"
            onSubmit={submitProjectForm.handleSubmit(onCreateProject)}
          >
            {isReposPending ? (
              // @to-do: check if this message ui is right
              // @to-do: make a component of loading like the button below
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground"
              >
                Loading repositories...
              </Button>
            ) : isReposError ? (
              // @to-do: check if this message ui is right
              <Typography variant="p">Failed to load repositories.</Typography>
            ) : (
              <FormField
                control={submitProjectForm.control}
                name="repositoryUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Popover
                        open={isComboboxOpen}
                        onOpenChange={setIsComboboxOpen}
                        {...field}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isComboboxOpen}
                            className={cn("justify-between", {
                              "text-muted-foreground": !field.value,
                            })}
                          >
                            {field.value
                              ? reposData.gitHubRepositories.find(
                                  (repo) => repo.url === field.value
                                )?.name
                              : "Select a repository (github)"}
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search repository..." />
                            <CommandList>
                              <CommandEmpty>No repository found.</CommandEmpty>
                              <CommandGroup>
                                {reposData.gitHubRepositories.map((repo) => (
                                  <CommandItem
                                    key={repo.url}
                                    value={repo.url}
                                    onSelect={() => {
                                      setIsComboboxOpen(false);
                                      submitProjectForm.setValue(
                                        "repositoryUrl",
                                        repo.url
                                      );
                                    }}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === repo.url
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {repo.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isTagsPending ? (
              // @to-do: check if this message ui is right
              <Typography variant="p">Loading tags...</Typography>
            ) : isTagsError ? (
              // @to-do: check if this message ui is right
              <Typography variant="p">Failed to load tags.</Typography>
            ) : (
              <FormField
                control={submitProjectForm.control}
                name="tagOptions"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MultipleSelector
                        defaultOptions={tagOptions}
                        placeholder="Tags"
                        emptyIndicator={
                          <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                            no results found.
                          </p>
                        }
                        hidePlaceholderWhenSelected
                        startIcon={
                          <Settings2 size={20} color="oklch(0.5032 0 0)" />
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button
              type="submit"
              size="xlg"
              className="w-full mt-2"
              disabled={createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
