import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToggleBookmarkMutation } from "@/hooks/useToggleBookmarkMutation";
import { useToggleVoteMutation } from "@/hooks/useToggleVoteMutation";
import { ConfirmDeletionDialog } from "@/components/layout/ConfirmDeletionDialog";
import { EditProjectDialog } from "@/components/layout/EditProjectDialog";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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
import type { Project } from "@/@types/project";

type ProjectCardProps = Project & {
  variant?: "default" | "editable";
};

export function ProjectCard({
  id,
  description,
  gitHubStars,
  license,
  liveLink,
  avatarUrl,
  name,
  votesCount,
  repoUrl,
  tags,
  variant = "default",
  isBookmarked,
  isVoted,
}: ProjectCardProps) {
  const { isAuthenticated } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] =
    useState(false);
  const toggleBookmarkMutation = useToggleBookmarkMutation(id, !!isBookmarked);
  const toggleVoteMutation = useToggleVoteMutation(id, !!isVoted);

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosPrivate.delete(`/projects/${id}`);
      return response.data;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ["submitted-projects"] });
      queryClient.refetchQueries({ queryKey: ["bookmarked-projects"] });

      setIsDeleteProjectDialogOpen(false);
      toast.success("Project deleted");
    },
    onError() {
      toast.error("Failed to delete project");
    },
  });

  return (
    <div className="relative rounded-xl shadow-sm hover:shadow-[var(--shadow-xl)]">
      <a href={repoUrl} target="_blank" className="absolute inset-0" />

      <Card className="transition-transform duration-200 gap-3 h-full">
        <CardHeader className="grid-cols-[auto_1fr_auto]!">
          <img
            src={avatarUrl || "https://github.com/evilrabbit.png"}
            alt={name}
            className="w-12 h-auto rounded-sm"
          />
          <div className="min-h-[52px] flex flex-col justify-center gap-1">
            <CardTitle className="line-clamp-2 break-all">{name}</CardTitle>
            <CardDescription className="line-clamp-1">
              {license || "No license"}
            </CardDescription>
          </div>
          <CardAction className="col-start-3 flex items-center gap-2.5 ml-2">
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
              <div className="flex flex-col gap-3">
                <EditProjectDialog
                  isOpen={isEditProjectDialogOpen}
                  setOpen={setIsEditProjectDialogOpen}
                  projectId={id}
                  liveLink={liveLink}
                  tags={tags}
                />

                <ConfirmDeletionDialog
                  isOpen={isDeleteProjectDialogOpen}
                  setOpen={setIsDeleteProjectDialogOpen}
                  entityType="project"
                  entityName={name}
                  deletionDescription="This project will be deleted, along with all of its votes, bookmarks and settings."
                  trigger={<Icon name="trash" outlineColor="#000" />}
                  deleteMutation={deleteProjectMutation}
                />
              </div>
            )}
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-2">
          <Typography variant="p" className="line-clamp-2 min-h-10">
            {description || "..."}
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
              No live link
            </Typography>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4 h-full">
          <div className="w-full flex gap-4">
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
                  {isAuthenticated
                    ? isVoted
                      ? "Unvote"
                      : "Upvote"
                    : "Upvotes"}
                </TooltipContent>
              </Tooltip>
              {votesCount}
            </div>
          </div>

          <div
            className={cn("w-full flex flex-wrap gap-1", {
              "mt-auto": !tags.length,
            })}
          >
            {tags.length ? (
              tags.map((tag) => (
                <Badge
                  key={tag.name}
                  variant="secondary"
                  className="font-semibold"
                >
                  {tag.name}
                </Badge>
              ))
            ) : (
              <Typography className="text-[var(--primary)] text-sm">
                No tags related
              </Typography>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
