export interface GameInfo {
    id: number;
    name: string;
    d64Path: string;
    thumbnailPath: string;
    description?: string;
    year?: number;
    publisher?: string;
    genre?: string;
    players?: string;
}
