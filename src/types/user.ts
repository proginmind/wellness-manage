import { Profile } from "./profile";

export interface User {
  id: string;
  email: string;
  created_at: string;
  profile?: Profile;
  organization?: {
    id: string;
    name: string;
    ownerEmail: string;
  };
}
