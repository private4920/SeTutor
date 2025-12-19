export { getFirebaseApp, getFirebaseAuth } from "./config";
export { AuthProvider, useAuth, type AuthUser } from "./AuthContext";
export {
  withProtectedRoute,
  ProtectedRoute,
} from "./ProtectedRoute";

// Server-side authentication (JWT verification)
export { 
  authenticateRequest, 
  verifyIdToken,
  type AuthResult,
  type AuthError,
  type AuthResponse 
} from "./admin";
