export interface GitHubUser {
  name: string;
  avatar_url: string;
  email: string | null;
  id: number;
}

export interface GitHubRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  license: {
    name: string;
  } | null;
  homepage: string | null;
  owner: {
    avatar_url: string | null;
  };
}
