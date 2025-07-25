import type { Control, FieldValues, Path } from "react-hook-form";
import { useTagsQuery } from "@/hooks/useTagsQuery";
import { LoadFailFormField } from "@/components/layout/LoadFailFormField";
import { MultipleSelector } from "@/components/ui/multiple-selector";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

type TagSelectorFormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
};

export function TagSelectorFormField<T extends FieldValues>({
  control,
  name,
}: TagSelectorFormFieldProps<T>) {
  const {
    tagOptionsFormatted,
    isError: isTagsError,
    isPending: isTagsPending,
  } = useTagsQuery();

  return isTagsError ? (
    <LoadFailFormField entityName="tags" />
  ) : (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <MultipleSelector
              options={tagOptionsFormatted}
              placeholder="Tags"
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
              isInitialLoading={isTagsPending}
              loadingIndicator={<Spinner />}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  // );
}
