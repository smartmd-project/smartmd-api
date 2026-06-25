export interface GithubProfileUser {
    provider: 'GITHUB';
    providerUserId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
};