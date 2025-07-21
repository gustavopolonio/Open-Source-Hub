import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { api } from "@/lib/axios";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { PaginatedProjectList } from "@/components/layout/PaginatedProjectList";
import { Typography } from "@/components/ui/typography";
import { MultipleSelector } from "@/components/ui/multiple-selector";
import type { Option } from "@/components/ui/multiple-selector";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { PaginatedProjects, Tag } from "@/@types/project";

type FilteredProjectsQueryParams = {
  limit: number;
  page: number;
  sort: string;
  tagIds?: string;
  search?: string;
};

export const Route = createFileRoute("/projects/")({
  component: Projects,
});

const tagOptionsSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

const filterProjectsFormSchema = z.object({
  tagOptions: z.array(tagOptionsSchema),
  projectName: z.string(),
  sortBy: z.string(),
});

function Projects() {
  const axiosPrivate = useAxiosPrivate();
  const { isAuthenticated } = useAuth();
  const axiosInstance = isAuthenticated ? axiosPrivate : api;

  const filterProjectsForm = useForm<z.infer<typeof filterProjectsFormSchema>>({
    resolver: zodResolver(filterProjectsFormSchema),
    defaultValues: {
      tagOptions: [],
      projectName: "",
      sortBy: "votes",
    },
  });

  const {
    data: tagsData,
    isError: isTagsError,
    isPending: isTagsPending,
  } = useQuery({
    staleTime: 1000 * 60 * 60, // 1 hour
    queryKey: ["tags"],
    queryFn: async (): Promise<{ tags: Tag[] }> => {
      const response = await api.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/tags`
      );
      return response.data;
    },
  });

  const watchedValues = useWatch({
    control: filterProjectsForm.control,
  });

  const debouncedFilterProjectsFormValues = useDebounce(watchedValues);

  const {
    data: projectsData,
    isPending: isProjectsPending,
    isError: isProjectsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["filtered-projects", debouncedFilterProjectsFormValues],
    queryFn: async ({ pageParam }): Promise<PaginatedProjects> => {
      const {
        projectName,
        tagOptions,
        sortBy = "votes",
      } = debouncedFilterProjectsFormValues;

      const tagIds = tagOptions?.map((tag) => tag.value).join(",");

      const params: FilteredProjectsQueryParams = {
        limit: 6,
        page: pageParam,
        sort: sortBy,
      };

      if (projectName?.trim()) {
        params.search = projectName.trim();
      }

      if (tagIds?.trim()) {
        params.tagIds = tagIds.trim();
      }

      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/projects`,
        { params }
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const tagOptions: Option[] =
    tagsData?.tags.map((tag) => ({
      label: tag.name,
      value: String(tag.id),
    })) ?? [];

  return (
    <div className="max-w-5xl mx-auto py-16 px-4 space-y-14">
      <Typography variant="h1" className="text-center">
        Explore all available projects
      </Typography>

      <Form {...filterProjectsForm}>
        <form className="space-y-2">
          {isTagsPending ? (
            // @to-do: check if this message ui is right
            <Typography variant="p">Loading tags...</Typography>
          ) : isTagsError ? (
            // @to-do: check if this message ui is right
            <Typography variant="p">Failed to load tags.</Typography>
          ) : (
            <FormField
              control={filterProjectsForm.control}
              name="tagOptions"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MultipleSelector
                      defaultOptions={tagOptions}
                      placeholder="Select tags to filter..."
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

          <div className="flex gap-2">
            <FormField
              control={filterProjectsForm.control}
              name="projectName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      placeholder="Search project by name..."
                      className="h-10"
                      startIcon={Search}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={filterProjectsForm.control}
              name="sortBy"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="min-w-[170px] min-h-10">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Sort by</SelectLabel>
                        <SelectItem value="votes">Most voted</SelectItem>
                        <SelectItem value="stars">Most Github stars</SelectItem>
                        <SelectItem value="github_created_at_desc">
                          Github newest first
                        </SelectItem>
                        <SelectItem value="github_created_at_asc">
                          Github oldest first
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>

      <PaginatedProjectList
        data={projectsData}
        isPending={isProjectsPending}
        isError={isProjectsError}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
}
