import z from "zod";
import type { ReactElement } from "react";
import { useForm } from "react-hook-form";
import { type UseMutationResult } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type ConfirmDeletionDialogProps = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  entityType: string;
  entityName: string;
  deletionDescription?: string;
  trigger: ReactElement;
  hasTooltipContent?: boolean;
  deleteMutation: UseMutationResult<unknown, Error, void, unknown>;
};

function getDeleteFormSchema(entityName: string, entityType: string) {
  return z.object({
    confirmationInput: z
      .string()
      .refine(
        (value) => value === entityName,
        `The ${entityType} name does not match`
      ),
  });
}

export function ConfirmDeletionDialog({
  isOpen,
  setOpen,
  entityType,
  entityName,
  deletionDescription,
  trigger,
  hasTooltipContent = true,
  deleteMutation,
}: ConfirmDeletionDialogProps) {
  const deleteFormSchema = getDeleteFormSchema(entityName, entityType);

  const deleteForm = useForm<z.infer<typeof deleteFormSchema>>({
    resolver: zodResolver(deleteFormSchema),
    defaultValues: {
      confirmationInput: "",
    },
  });

  function onDeleteEntity() {
    deleteMutation.mutate();
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setTimeout(() => {
            deleteForm.reset({
              confirmationInput: "",
            });
          }, 350);
        }
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild className="z-10">
          <DialogTrigger asChild>{trigger}</DialogTrigger>
        </TooltipTrigger>
        {hasTooltipContent && (
          <TooltipContent side="right">Delete {entityType}</TooltipContent>
        )}
      </Tooltip>
      <DialogContent>
        <Form {...deleteForm}>
          <form
            onSubmit={deleteForm.handleSubmit(onDeleteEntity)}
            className="grid gap-4"
          >
            <DialogHeader>
              <DialogTitle>Delete {entityType}</DialogTitle>
              <DialogDescription>
                {deletionDescription ??
                  `This ${entityType} will be permanently deleted.`}
              </DialogDescription>
              <Typography className="text-sm text-destructive-secondary-foreground bg-destructive-secondary py-2 px-3 rounded-md">
                Warning: This action is not reversible. Please be certain.
              </Typography>
            </DialogHeader>
            <div className="grid gap-4 py-6 border-y-[1px] border-[--border]">
              <FormField
                control={deleteForm.control}
                name="confirmationInput"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>
                      Enter the {entityType} name <b>{entityName}</b> to
                      continue
                    </FormLabel>
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
              <Button
                disabled={deleteMutation.isPending}
                type="submit"
                variant="destructive"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
