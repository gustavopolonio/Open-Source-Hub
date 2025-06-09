import { createFileRoute, Link } from "@tanstack/react-router";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/layout/ProjectCard";

export const Route = createFileRoute("/")({
  component: Index,
});

const projects = [
  {
    id: 12,
    gitHubProjectId: 607266881,
    name: "formulario-html-css e javascript com tudo o que vc possa imaginar",
    description: "Formulário criado usando HTML, CSS e JavaScript.",
    programmingLanguage: "javascript",
    gitHubStars: 1,
    license: null,
    liveLink: "https://google.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/69776883?v=4",
    repo_url: "https://github.com/gustavopolonio/formulario-html-css",
    createdAt: "2025-06-04T16:34:02.919Z",
    gitHubCreatedAt: "2025-06-04T15:23:01.650Z",
    updatedAt: "2025-06-04T18:28:36.062Z",
    submittedBy: 1,
    tags: [
      {
        id: 3,
        name: "typescript",
      },
      {
        id: 5,
        name: "css",
      },
    ],
    _count: {
      votes: 0,
    },
  },
  {
    id: 4,
    gitHubProjectId: 907161649,
    name: "adopto",
    description:
      "API  for animal adoption - Node + Fastify, API  for animal adoption - Node + Fastify , API  for animal adoption - Node + Fastify",
    programmingLanguage: "javascript",
    gitHubStars: 0,
    license: "MIT License License LicenseLicense",
    liveLink: "",
    avatarUrl: "https://avatars.githubusercontent.com/u/69776883?v=4",
    repo_url: "https://github.com/gustavopolonio/adopto",
    createdAt: "2025-06-03T22:18:49.208Z",
    gitHubCreatedAt: "2025-06-04T15:23:02.650Z",
    updatedAt: "2025-06-04T17:19:43.473Z",
    submittedBy: 1,
    tags: [
      {
        id: 1,
        name: "beginner-friendly",
      },
      {
        id: 4,
        name: "html",
      },
    ],
    _count: {
      votes: 3,
    },
  },
  {
    id: 12,
    gitHubProjectId: 607266881,
    name: "formulario-html-css",
    description: "Formulário criado usando HTML, CSS e JavaScript.",
    programmingLanguage: "javascript",
    gitHubStars: 1,
    license: null,
    liveLink: "https://google.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/69776883?v=4",
    repo_url: "https://github.com/gustavopolonio/formulario-html-css",
    createdAt: "2025-06-04T16:34:02.919Z",
    gitHubCreatedAt: "2025-06-04T15:23:01.650Z",
    updatedAt: "2025-06-04T18:28:36.062Z",
    submittedBy: 1,
    tags: [
      {
        id: 3,
        name: "typescript",
      },
      {
        id: 5,
        name: "css",
      },
    ],
    _count: {
      votes: 0,
    },
  },
  {
    id: 12,
    gitHubProjectId: 607266881,
    name: "formulario-html-css",
    description: "Formulário criado usando HTML, CSS e JavaScript.",
    programmingLanguage: "javascript",
    gitHubStars: 1,
    license: null,
    liveLink: "https://google.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/69776883?v=4",
    repo_url: "https://github.com/gustavopolonio/formulario-html-css",
    createdAt: "2025-06-04T16:34:02.919Z",
    gitHubCreatedAt: "2025-06-04T15:23:01.650Z",
    updatedAt: "2025-06-04T18:28:36.062Z",
    submittedBy: 1,
    tags: [
      {
        id: 3,
        name: "typescript",
      },
      {
        id: 5,
        name: "css",
      },
    ],
    _count: {
      votes: 0,
    },
  },
  {
    id: 12,
    gitHubProjectId: 607266881,
    name: "formulario-html-css",
    description: "Formulário criado usando HTML, CSS e JavaScript.",
    programmingLanguage: "javascript",
    gitHubStars: 1,
    license: null,
    liveLink: "https://google.com",
    avatarUrl: "https://avatars.githubusercontent.com/u/69776883?v=4",
    repo_url: "https://github.com/gustavopolonio/formulario-html-css",
    createdAt: "2025-06-04T16:34:02.919Z",
    gitHubCreatedAt: "2025-06-04T15:23:01.650Z",
    updatedAt: "2025-06-04T18:28:36.062Z",
    submittedBy: 1,
    tags: [
      {
        id: 3,
        name: "typescript",
      },
      {
        id: 5,
        name: "css",
      },
    ],
    _count: {
      votes: 0,
    },
  },
];

function Index() {
  return (
    <div className="max-w-5xl mx-auto py-16 px-4 space-y-14">
      <div className="max-w-2xl mx-auto space-y-8">
        <Typography variant="h1" className="text-center">
          Contribute to open source projects
        </Typography>
        <Typography variant="p" className="text-center">
          Open Source Hub is a platform that connects developers with
          open-source opportunities effectively
        </Typography>
        <div className="flex justify-center gap-4">
          <Button className="font-bold" size="xlg" asChild>
            <Link to="/projects">Browse projects</Link>
          </Button>
          <Button className="font-bold" size="xlg" variant="secondary" asChild>
            <Link to="/projects/submit">Submit yours</Link>
          </Button>
        </div>
      </div>
      <div className="space-y-8">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
          {projects.map((project) => (
            <ProjectCard
              description={project.description}
              gitHubRepoUrl={project.repo_url}
              gitHubStars={project.gitHubStars}
              license={project.license}
              liveLink={project.liveLink}
              logoUrl={project.avatarUrl}
              programmingLanguage={project.programmingLanguage}
              title={project.name}
              votes={project._count.votes}
              tags={project.tags}
            />
          ))}
        </div>
        <Button className="font-bold flex mx-auto" size="xlg" variant="outline">
          Load more...
        </Button>
      </div>
      <div className="max-w-2xl mx-auto space-y-4">
        <Typography variant="h2" className="text-center mt-12">
          Open your code
        </Typography>
        <Typography variant="p" className="text-center">
          Every great contribution starts with an open repository. Share your
          project and collaborate with developers around the world.
        </Typography>
        <div className="flex justify-center gap-4">
          <Button className="font-bold" size="xlg">
            <Link to="/projects/submit">Submit your project</Link>
          </Button>
          <Button className="font-bold" size="xlg" variant="secondary" asChild>
            <Link to="/projects/submit">Explore all</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
