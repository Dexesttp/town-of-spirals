export type Message = {
  author: string;
  content: string;
  private: boolean;
};

export type ClientMessage<T> = {
  author: string;
  content: string;
  private: boolean;
  original: T;
};
