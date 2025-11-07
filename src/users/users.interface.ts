export interface IUser {
    _id: string;
    name: string;
    email: string;
    role?: string;
    unit?: string | null;
    position?: string | null;
}