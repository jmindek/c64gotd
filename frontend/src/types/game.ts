export interface GameInfo {
    id: number;
    name: string;
    d64Path: string;
    thumbnailPath: string;
    d64Url?: string;
    thumbnailUrl?: string;
    description?: string;
    year?: number;
    publisher?: string;
    genre?: string;
    players?: string;
}
