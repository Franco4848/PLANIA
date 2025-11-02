export interface UserToken {
  email: string;
  role: 'admin' | 'user' | 'editor';
}
