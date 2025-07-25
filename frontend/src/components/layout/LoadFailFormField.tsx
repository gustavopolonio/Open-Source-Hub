import { Typography } from "@/components/ui/typography";

type LoadFailFormFieldProps = {
  entityName: string;
};

export function LoadFailFormField({ entityName }: LoadFailFormFieldProps) {
  return (
    <div className="cursor-not-allowed h-10 px-3 flex items-center rounded-md border border-input text-base ring-offset-background md:text-sm">
      <Typography className="text-muted-foreground ">
        Failed to load {entityName}
      </Typography>
    </div>
  );
}
