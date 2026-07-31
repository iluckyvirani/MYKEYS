/**
 * Standard Error Codes
 */
export enum ErrorCode {
  // Authentication Errors
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INVALID_TOKEN = "INVALID_TOKEN",

  // Validation Errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",

  // Resource Errors
  USER_NOT_FOUND = "USER_NOT_FOUND",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  PHONE_ALREADY_EXISTS = "PHONE_ALREADY_EXISTS",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",

  // Account Status Errors
  ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED",
  ACCOUNT_INACTIVE = "ACCOUNT_INACTIVE",
  ACCOUNT_PENDING = "ACCOUNT_PENDING",

  // Password Errors
  WEAK_PASSWORD = "WEAK_PASSWORD",
  PASSWORD_MISMATCH = "PASSWORD_MISMATCH",
  INVALID_RESET_TOKEN = "INVALID_RESET_TOKEN",
  RESET_TOKEN_EXPIRED = "RESET_TOKEN_EXPIRED",
  INVALID_OTP = "INVALID_OTP",
  OTP_EXPIRED = "OTP_EXPIRED",

  // Server Errors
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: ErrorCode;
  public errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
  }
}

/**
 * Error message mapper
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // Authentication
  [ErrorCode.INVALID_CREDENTIALS]: "Invalid email or password",
  [ErrorCode.UNAUTHORIZED]: "You must be logged in to access this resource",
  [ErrorCode.FORBIDDEN]: "You don't have permission to access this resource",
  [ErrorCode.TOKEN_EXPIRED]: "Your session has expired. Please login again",
  [ErrorCode.INVALID_TOKEN]: "Invalid authentication token",

  // Validation
  [ErrorCode.VALIDATION_ERROR]: "Validation failed. Please check your input",
  [ErrorCode.INVALID_INPUT]: "Invalid input provided",

  // Resources
  [ErrorCode.USER_NOT_FOUND]: "User not found",
  [ErrorCode.USER_ALREADY_EXISTS]: "User already exists",
  [ErrorCode.EMAIL_ALREADY_EXISTS]: "Email is already registered",
  [ErrorCode.PHONE_ALREADY_EXISTS]: "Phone number is already registered",
  [ErrorCode.RESOURCE_NOT_FOUND]: "Resource not found",

  // Account Status
  [ErrorCode.ACCOUNT_SUSPENDED]:
    "Your account has been suspended. Please contact support",
  [ErrorCode.ACCOUNT_INACTIVE]:
    "Your account is inactive. Please contact support",
  [ErrorCode.ACCOUNT_PENDING]:
    "Please verify your email with the OTP we sent you",
  [ErrorCode.INVALID_OTP]: "Invalid OTP. Please check and try again",
  [ErrorCode.OTP_EXPIRED]: "OTP has expired. Please request a new one",

  // Password
  [ErrorCode.WEAK_PASSWORD]: "Password is too weak. Please choose a stronger password",
  [ErrorCode.PASSWORD_MISMATCH]: "Passwords do not match",
  [ErrorCode.INVALID_RESET_TOKEN]: "Invalid or expired password reset token",
  [ErrorCode.RESET_TOKEN_EXPIRED]: "Password reset token has expired",

  // Server
  [ErrorCode.INTERNAL_SERVER_ERROR]:
    "An unexpected error occurred. Please try again later",
  [ErrorCode.DATABASE_ERROR]: "Database error occurred. Please try again later",
  [ErrorCode.SERVICE_UNAVAILABLE]:
    "Service is temporarily unavailable. Please try again later",

  // Rate Limiting
  [ErrorCode.RATE_LIMIT_EXCEEDED]:
    "Please wait before requesting another OTP",
};

/**
 * HTTP Status Code mapper
 */
export const ErrorStatusCodes: Record<ErrorCode, number> = {
  // 401 Unauthorized
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,

  // 403 Forbidden
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.ACCOUNT_SUSPENDED]: 403,
  [ErrorCode.ACCOUNT_INACTIVE]: 403,
  [ErrorCode.ACCOUNT_PENDING]: 403,

  // 400 Bad Request
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.WEAK_PASSWORD]: 400,
  [ErrorCode.PASSWORD_MISMATCH]: 400,
  [ErrorCode.INVALID_RESET_TOKEN]: 400,
  [ErrorCode.RESET_TOKEN_EXPIRED]: 400,
  [ErrorCode.INVALID_OTP]: 400,
  [ErrorCode.OTP_EXPIRED]: 400,

  // 404 Not Found
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,

  // 409 Conflict
  [ErrorCode.USER_ALREADY_EXISTS]: 409,
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 409,
  [ErrorCode.PHONE_ALREADY_EXISTS]: 409,

  // 429 Too Many Requests
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,

  // 500 Internal Server Error
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,

  // 503 Service Unavailable
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
};

/**
 * Create standardized API error
 */
export function createApiError(
  code: ErrorCode,
  customMessage?: string,
  errors?: Record<string, string[]>
): ApiError {
  const message = customMessage || ErrorMessages[code];
  const statusCode = ErrorStatusCodes[code];
  return new ApiError(message, statusCode, code, errors);
}
