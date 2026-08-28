export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiError = {
  success: false;

  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> =
  | ApiSuccess<T>
  | ApiError;

export function successResponse<T>(
  data: T,
  message?: string,
): ApiSuccess<T> {
  return {
    success: true,
    data,
    ...(message
      ? { message }
      : {}),
  };
}

export function errorResponse(
  code: string,
  message: string,
): ApiError {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}