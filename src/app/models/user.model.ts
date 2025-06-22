// src/app/models/user.models.ts
// Optional: If your backend provides a user details endpoint

export interface UserApiResponse {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  user_type: string;
  national_number?: string | null;
  avatar?: string | null;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  groups?: string[];
  // permissions?: string[];
  profile?: {
    phone?: string;
    department?: string;
    position?: string;
    [key: string]: any;
  };
}

// Example backend endpoint that could be implemented:
// GET /api/users/{id}/ - Get user details by ID
// GET /api/users/me/ - Get current user details
// PATCH /api/users/{id}/ - Update user details
// POST /api/users/{id}/avatar/ - Upload avatar image
