import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/axios";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { PaginatedProjectList } from "@/components/layout/PaginatedProjectList";
import { TagSelectorFormField } from "@/components/layout/TagSelectorFormField";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
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
import { tagOptionsSchema } from "@/schemas/formSchemas";
import type { PaginatedProjects } from "@/@types/project";

const filterProjectsFormSchema = z.object({
  tagOptions: z.array(tagOptionsSchema),
  projectName: z.string(),
  sortBy: z.string(),
});

type FilterProjectsFormValues = z.infer<typeof filterProjectsFormSchema>;

type FilteredProjectsQueryParams = {
  limit: number;
  page: number;
  sort: string;
  tagIds?: string;
  search?: string;
};

export const Route = createFileRoute("/_layoutWithContainer/projects/")({
  component: Projects,
});

function Projects() {
  const axiosPrivate = useAxiosPrivate();
  const { isAuthenticated } = useAuth();
  const axiosInstance = isAuthenticated ? axiosPrivate : api;

  const filterProjectsForm = useForm<FilterProjectsFormValues>({
    resolver: zodResolver(filterProjectsFormSchema),
    defaultValues: {
      tagOptions: [],
      projectName: "",
      sortBy: "votes",
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

  return (
    <>
      <Typography variant="h1" className="text-center">
        Explore all available projects
      </Typography>

      <Form {...filterProjectsForm}>
        <form className="space-y-2">
          <TagSelectorFormField<FilterProjectsFormValues>
            control={filterProjectsForm.control}
            name="tagOptions"
          />

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
    </>
  );
}
