export type TokenPayload = {
  sub: string;
  role: string | null;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
};
