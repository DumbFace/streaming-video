type Exception = {
  name: string;
  message?: string;
  code: number;
};

export type FnSucceedResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type FnFailResponse = {
  success: false;
  message: string;
  exception?: Exception;
};

export type FlexibleFnResponse<T> = FnFailResponse | FnSucceedResponse<T>;

export const FnResponse = {
  Succeed: <T>(message: string, data: T): FnSucceedResponse<T> => {
    return { success: true, message: message, data: data };
  },
  Fail: (message: string, exception?: Exception): FnFailResponse => {
    return {
      success: false,
      message: message,
      exception,
    };
  },
};
