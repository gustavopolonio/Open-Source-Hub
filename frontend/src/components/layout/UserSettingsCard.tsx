import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { UserSettingsCardSkeleton } from "@/components/layout/UserSettingsCardSkeleton";
import { Typography } from "@/components/ui/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import type { User } from "@/@types/user";

const updateAuthenticatedUserFormSchema = z.object({
  username: z.string().min(3),
  avatarUrl: z.string().url(),
  bio: z.string().min(8),
});

export function UserSettingsCard() {
  const axiosPrivate = useAxiosPrivate();
  const [isUpdateUserModalOpen, setIsUpdateUserModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: userData,
    isError: isUserError,
    isPending: isUserPending,
    isSuccess: isUserSuccess,
  } = useQuery<{ user: User }>({
    queryKey: ["user"],
    staleTime: 1000 * 60 * 60, // 1 hour
    queryFn: async () => {
      const response = await axiosPrivate.get("/users/me");
      return response.data;
    },
  });

  const updateAuthenticatedUserForm = useForm<
    z.infer<typeof updateAuthenticatedUserFormSchema>
  >({
    resolver: zodResolver(updateAuthenticatedUserFormSchema),
    defaultValues: {
      username: "",
      avatarUrl: "",
      bio: "",
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (newUserData: Omit<User, "email">) => {
      const response = await axiosPrivate.patch("/users/me", newUserData);
      return response.data;
    },
    onSuccess(data: { updatedUser: User }) {
      queryClient.setQueryData<{ user: User }>(["user"], (oldData) => {
        if (!oldData) return;

        return {
          ...oldData,
          user: {
            ...oldData.user,
            name: data.updatedUser.name,
            bio: data.updatedUser.bio,
            avatarUrl: data.updatedUser.avatarUrl,
          },
        };
      });

      // @to-do: add success toast component
      alert("User updated!");
      setIsUpdateUserModalOpen(false);
    },
    onError() {
      // @to-do: add failed toast component
      alert("Failed to update user");
    },
  });

  function onUpdateUser(
    values: z.infer<typeof updateAuthenticatedUserFormSchema>
  ) {
    updateUserMutation.mutate({ name: values.username, ...values });
  }

  useEffect(() => {
    if (userData && isUserSuccess) {
      updateAuthenticatedUserForm.reset({
        username: userData.user.name,
        avatarUrl: userData.user.avatarUrl,
        bio: userData.user.bio,
      });
    }
  }, [userData, isUserSuccess, updateAuthenticatedUserForm]);

  return isUserError ? (
    <div className="text-center text-destructive">
      <Typography variant="p">Failed to load user data :(</Typography>
    </div>
  ) : isUserPending ? (
    <UserSettingsCardSkeleton />
  ) : (
    <Dialog
      open={isUpdateUserModalOpen}
      onOpenChange={(open) => {
        setIsUpdateUserModalOpen(open);
        if (!open && userData) {
          setTimeout(() => {
            updateAuthenticatedUserForm.reset({
              username: userData.user.name,
              avatarUrl: userData.user.avatarUrl,
              bio: userData.user.bio,
            });
          }, 350);
        }
      }}
    >
      <DialogTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsUpdateUserModalOpen(true);
            }
          }}
          className="space-y-6 w-full flex flex-col cursor-pointer bg-card text-card-foreground rounded-xl border p-6 shadow-sm transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-ring hover:shadow-[var(--shadow-xl)]"
        >
          <div className="w-full flex justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={userData.user.avatarUrl}
                  alt={userData.user.name}
                />
                <AvatarFallback>
                  {userData.user.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <Typography variant="h3" className="line-clamp-1 text-ellipsis">
                {userData.user.name}
              </Typography>
            </div>

            <Icon name="edit" outlineColor="#000" />
          </div>

          <Typography className="w-full">
            <b>Bio: </b>
            {userData.user.bio}
          </Typography>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...updateAuthenticatedUserForm}>
          <form
            onSubmit={updateAuthenticatedUserForm.handleSubmit(onUpdateUser)}
            className="grid gap-4"
          >
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <FormField
                control={updateAuthenticatedUserForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateAuthenticatedUserForm.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateAuthenticatedUserForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button disabled={updateUserMutation.isPending} type="submit">
                {updateUserMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
