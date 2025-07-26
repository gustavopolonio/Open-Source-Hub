import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useAuth } from "@/hooks/useAuth";
import { UserSettingsCard } from "@/components/layout/UserSettingsCard";
import { PaginatedProjectList } from "@/components/layout/PaginatedProjectList";
import { ConfirmDeletionDialog } from "@/components/layout/ConfirmDeletionDialog";
import { Typography } from "@/components/ui/typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { PaginatedProjects } from "@/@types/project";
import type { User } from "@/@types/user";

export const Route = createFileRoute("/_layoutWithContainer/account")({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: Account,
});

function Account() {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);

  const { data: userData } = useQuery<{ user: User }>({
    queryKey: ["user"],
    staleTime: 1000 * 60 * 60, // 1 hour
    queryFn: async () => {
      const response = await axiosPrivate.get("/users/me");
      return response.data;
    },
  });

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
    }): Promise<PaginatedProjects> => {
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
    }): Promise<PaginatedProjects> => {
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

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosPrivate.delete(`/users/me`);
      return response.data;
    },
    async onSuccess() {
      try {
        await api.post("/logout", {}, { withCredentials: true });

        toast.success("Account deleted");
        setAccessToken(null);
        navigate({ to: "/" });
      } catch {
        toast.error(
          "Account deleted, but logout failed. Please clear your cookies manually"
        );
      } finally {
        setIsDeleteUserDialogOpen(false);
      }
    },
    onError() {
      toast.error("Failed to delete account");
    },
  });

  return (
    <>
      <div className="max-w-2xl w-full mx-auto space-y-14">
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
            <PaginatedProjectList
              data={submittedProjectsData}
              isPending={isSubmittedProjectsPending}
              isError={isSubmittedProjectsError}
              fetchNextPage={fetchSubmittedProjectsNextPage}
              hasNextPage={submittedProjectsHasNextPage}
              isFetchingNextPage={isFetchingSubmittedProjectsNextPage}
              projectCardVariant="editable"
            />
          </TabsContent>

          <TabsContent value="bookmarked">
            <PaginatedProjectList
              data={bookmarkedProjectsData}
              isPending={isBookmarkedProjectsPending}
              isError={isBookmarkedProjectsError}
              fetchNextPage={fetchBookmarkedProjectsNextPage}
              hasNextPage={bookmarkedProjectsHasNextPage}
              isFetchingNextPage={isFetchingBookmarkedProjectsNextPage}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 flex flex-col items-center">
        <Typography variant="h2" className="text-center">
          Delete account
        </Typography>

        <Typography className="text-center">
          Permanently remove your account and all of its projects. This action
          is not reversible, so please continue with caution.
        </Typography>

        <ConfirmDeletionDialog
          isOpen={isDeleteUserDialogOpen}
          setOpen={setIsDeleteUserDialogOpen}
          entityType="account"
          entityName={userData?.user.name || ""}
          deletionDescription="Your account will be deleted, along with all your projects and settings."
          trigger={
            <Button variant="destructive" size="xlg" className="font-bold">
              Delete account
            </Button>
          }
          hasTooltipContent={false}
          deleteMutation={deleteUserMutation}
        />
      </div>
    </>
  );
}
