import { Typography } from "../ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
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
} from "../ui/card";

type Tag = {
  name: string;
};

type ProjectCardProps = {
  logoUrl: string | null;
  title: string;
  license: string | null;
  description: string | null;
  liveLink: string | null;
  gitHubStars: number;
  votes: number;
  programmingLanguage: string | null;
  gitHubRepoUrl: string;
  tags: Tag[];
};

export function ProjectCard({
  description,
  gitHubStars,
  license,
  liveLink,
  logoUrl,
  programmingLanguage,
  title,
  votes,
  gitHubRepoUrl,
  tags,
}: ProjectCardProps) {
  return (
    <div className="relative rounded-xl shadow-sm hover:shadow-[var(--shadow-xl)]">
      <a href={gitHubRepoUrl} target="_blank" className="absolute inset-0" />
      <Card className="transition-transform duration-200 gap-3 h-full">
        <CardHeader className="grid-cols-[auto_1fr_auto]!">
          <img
            src={logoUrl || "https://github.com/evilrabbit.png"}
            alt={title}
            className="w-12 h-auto rounded-sm"
          />
          <div className="min-h-[52px] flex flex-col justify-center gap-1">
            <CardTitle className="line-clamp-2 break-all">{title}</CardTitle>
            <CardDescription className="line-clamp-1">
              {license || "No license"}
            </CardDescription>
          </div>
          <CardAction className="col-start-3 flex items-center gap-2.5 ml-2">
            <Tooltip>
              <TooltipTrigger className="z-10 w-5 h-5 rounded-full border-2 border-[var(--primary)] bg-[var(--secondary)]"></TooltipTrigger>
              <TooltipContent className="py-2.5">
                <p className="flex gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag.name} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger className="z-10">
                {/* @to-do: if/else fill bookmark if user already bookmarked project */}
                <Icon name="bookmark" outlineColor="primary" />
              </TooltipTrigger>
              {/* @to-do: if/else update text to bookmarked if user already bookmarked project */}
              <TooltipContent>Bookmark</TooltipContent>
            </Tooltip>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-2">
          <Typography variant="p" className="line-clamp-2 min-h-10">
            {description}
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
              No live link provided
            </Typography>
          )}
        </CardContent>
        <CardFooter className="flex gap-4">
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
              <TooltipTrigger className="z-10">
                {/* @to-do: if/else fill triangle if user already voted on project */}
                <Icon
                  name="triangle"
                  outlineColor="oklch(54.6% 0.245 262.881)"
                />
              </TooltipTrigger>
              {/* @to-do: if/else update text to upvoted if user already voted on project */}
              <TooltipContent>Upvote</TooltipContent>
            </Tooltip>
            {votes}
          </div>
          {programmingLanguage && (
            <Badge variant="secondary" className="ml-auto">
              {programmingLanguage}
            </Badge>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
