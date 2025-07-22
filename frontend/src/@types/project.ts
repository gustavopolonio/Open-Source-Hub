export type Tag = {
  id: number;
  name: string;
};

export type Project = {
  id: number;
  name: string;
  description: string | null;
  repoUrl: string;
  gitHubStars: number;
  license: string | null;
  liveLink: string | null;
  avatarUrl: string | null;
  programmingLanguage: string | null;
  tags: Tag[];
  _count: {
    votes: number;
  };
  isBookmarked?: boolean;
  isVoted?: boolean;
};

export type PaginatedProjects = {
  nextPage: number | null;
  projects: Project[];
  totalCount: number;
};

export type EditProjectRequestBody = {
  liveLink: string;
  tagIds: number[];
};

export type EditProjectResponse = {
  updatedProject: {
    liveLink: string;
    tags: Tag[];
  };
};

export type CreateProjectRequestBody = {
  repoUrl: string;
  tagIds: number[];
};
