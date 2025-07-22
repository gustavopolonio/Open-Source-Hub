import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useTagsQuery } from "@/hooks/useTagsQuery";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultipleSelector } from "@/components/ui/multiple-selector";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type {
  EditProjectRequestBody,
  EditProjectResponse,
  PaginatedProjects,
  Tag,
} from "@/@types/project";

type EditProjectDialogProps = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  projectId: number;
  tags: Tag[];
  liveLink: string | null;
};

const tagOptionsSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

const editProjectFormSchema = z.object({
  tagOptions: z.array(tagOptionsSchema),
  liveLink: z.string().url(),
});

export function EditProjectDialog({
  isOpen,
  setOpen,
  projectId,
  tags,
  liveLink,
}: EditProjectDialogProps) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const {
    tagOptionsFormatted,
    isError: isTagsError,
    isPending: isTagsPending,
  } = useTagsQuery();

  const editProjectForm = useForm<z.infer<typeof editProjectFormSchema>>({
    resolver: zodResolver(editProjectFormSchema),
    defaultValues: {
      tagOptions: tags.map((tag) => ({
        label: tag.name,
        value: String(tag.id),
      })),
      liveLink: liveLink || "",
    },
  });

  const editProjectMutation = useMutation({
    mutationFn: async (projectData: EditProjectRequestBody) => {
      const response = await axiosPrivate.patch(
        `/projects/${projectId}`,
        projectData
      );
      return response.data;
    },
    onSuccess(data: EditProjectResponse) {
      function updateProjectData(
        oldData: InfiniteData<PaginatedProjects> | undefined
      ) {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            projects: page.projects.map((project) => {
              if (project.id === projectId) {
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

      queryClient.setQueryData<InfiniteData<PaginatedProjects>>(
        ["submitted-projects"],
        (oldData) => updateProjectData(oldData)
      );

      queryClient.setQueryData<InfiniteData<PaginatedProjects>>(
        ["bookmarked-projects"],
        (oldData) => updateProjectData(oldData)
      );

      const filteredQueries = queryClient.getQueriesData<
        InfiniteData<PaginatedProjects>
      >({
        queryKey: ["filtered-projects"],
        exact: false,
      });

      for (const [queryKey, data] of filteredQueries) {
        // @to-do: when user votes on page /projects the oerder of 'Most voted' doesnt change, because it's cached. Check this
        queryClient.setQueryData(queryKey, updateProjectData(data));
      }

      // @to-do: add success toast component
      alert("Project updated!");
      setOpen(false);
    },
    onError() {
      // @to-do: add failed toast component
      alert("Failed to update project");
    },
  });

  function onEditProject(values: z.infer<typeof editProjectFormSchema>) {
    const { liveLink, tagOptions } = values;
    const tagIds = tagOptions.map((tag) => Number(tag.value));
    editProjectMutation.mutate({
      liveLink,
      tagIds,
    });
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setTimeout(() => {
            editProjectForm.reset({
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
        <TooltipContent side="right">Edit project</TooltipContent>
      </Tooltip>
      <DialogContent>
        <Form {...editProjectForm}>
          <form
            onSubmit={editProjectForm.handleSubmit(onEditProject)}
            className="grid gap-4"
          >
            <DialogHeader>
              <DialogTitle>Edit project</DialogTitle>
              <DialogDescription>
                Make changes to your project here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <FormField
                control={editProjectForm.control}
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
                <Typography variant="p">Failed to load tags.</Typography>
              ) : (
                <FormField
                  control={editProjectForm.control}
                  name="tagOptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <MultipleSelector
                          defaultOptions={tagOptionsFormatted}
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
              <Button disabled={editProjectMutation.isPending} type="submit">
                {editProjectMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
