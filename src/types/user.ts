export type User = {
  id: string;
  email: string;
};

export type SignupResponse = User & {
  createdAt: string;
};

export type LoginResponse = User;
