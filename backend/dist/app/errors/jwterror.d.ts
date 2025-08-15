import { JWTErrorType } from "../auth_interface";
export declare class JWTError extends Error {
    readonly type: JWTErrorType;
    readonly statusCode: number;
    constructor(type: JWTErrorType, message: string, statusCode?: number);
}
//# sourceMappingURL=jwterror.d.ts.map