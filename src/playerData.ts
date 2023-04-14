export type UserData = {
    uuid: string;
    name: string;
    deaths: number;
    respects: number;
    respectsGiven: number;
    customDisplay?: string | undefined;
    quietMode: boolean;
    discordId?: string | undefined;
}