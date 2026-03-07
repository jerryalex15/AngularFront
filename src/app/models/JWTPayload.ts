export interface JWTPayload {
    sub: string;
    exp: number;
    iat: number;
}