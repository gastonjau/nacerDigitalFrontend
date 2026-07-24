export type UserProfile = {
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  publicGists: number;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitterUsername: string | null;
  createdAt: string;
};
