import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "@/lib/axios";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useAuth } from "@/hooks/useAuth";
import { PaginatedProjectList } from "@/components/layout/PaginatedProjectList";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import type { PaginatedProjects } from "@/@types/project";

export const Route = createFileRoute("/_layoutWithContainer/")({
  component: Index,
});

function Index() {
  const axiosPrivate = useAxiosPrivate();
  const { isAuthenticated } = useAuth();
  const axiosInstance = isAuthenticated ? axiosPrivate : api;

  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["projects"],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<PaginatedProjects> => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/projects`,
        {
          params: {
            limit: 15,
            page: pageParam,
          },
        }
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-8">
        <Typography variant="h1" className="text-center">
          Contribute to open source projects
        </Typography>
        <Typography variant="p" className="text-center">
          Open Source Hub is a platform that connects developers with
          open-source opportunities effectively
        </Typography>
        <div className="flex justify-center gap-4 max-xs:flex-col">
          <Button className="font-bold" size="xlg" asChild>
            <Link to="/projects">Browse projects</Link>
          </Button>
          <Button className="font-bold" size="xlg" variant="secondary" asChild>
            <Link to="/projects/submit">Submit yours</Link>
          </Button>
        </div>
      </div>

      <PaginatedProjectList
        data={data}
        isPending={isPending}
        isError={isError}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        showCountInfo={false}
      />

      <div className="max-w-2xl mx-auto space-y-4">
        <Typography variant="h2" className="text-center">
          Open your code
        </Typography>
        <Typography variant="p" className="text-center">
          Every great contribution starts with an open repository. Share your
          project and collaborate with developers around the world.
        </Typography>
        <div className="flex justify-center gap-4 max-xs:flex-col">
          <Button className="font-bold" size="xlg">
            <Link to="/projects/submit">Submit your project</Link>
          </Button>
          <Button className="font-bold" size="xlg" variant="secondary" asChild>
            <Link to="/projects">Explore all</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
