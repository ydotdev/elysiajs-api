import { Codes } from "../utils/httpCodesAndMessages";
import ResponseHandler from "../utils/ResponseHandler";

/**
 * Authentication middleware for verifying JWT tokens.
 * 
 * This middleware:
 * - Extracts the token from the `Authorization` header.
 * - Verifies the token using `jwt.verify()`.
 * - If valid, attaches the decoded profile to `store.profile`.
 * - If invalid, responds with appropriate error messages.
 * 
 * @param {Object} context - Context object containing `jwt`, `headers`, `set`, and `store`.
 */

export const authMiddleware = async ({ jwt, headers, set, store }: any) => {
    // Extract the Authorization header
  const authHeader: string = headers.authorization;

    /**
   * Check if the Authorization header is missing or improperly formatted.
   * The expected format is: "Bearer <token>"
   */
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return ResponseHandler.sendError(
      set,
      "No token provided",
      Codes.UNAUTHORIZED,
      "Unauthorized: No token provided"
    );
  }
  // Extract the actual token (removes "Bearer " prefix)

  const token = authHeader.split(" ")[1];

  try {
        // Verify the token and extract the user profile

    const profile = await jwt.verify(token);

        /**
     * If the token is invalid or verification fails, return an unauthorized error.
     */
    if (!profile) {
      return ResponseHandler.sendError(
        set,
        "Invalid token",
        Codes.UNAUTHORIZED,
        "Unauthorized: Invalid token"
      );
    }

    if (profile.username !== "admin") {
      return ResponseHandler.sendError(
        set,
        "Forbidden",
        Codes.FORBIDDEN,
        "Access denied: Only admin can access this"
      );
    }
        // Store the authenticated user's profile for use in subsequent handlers/controllers

    store.profile = profile;
    console.log("Middleware done => proceeding to controller");
    return
  } catch (error: any) {
        // Default status code and message for authentication failure

    let statusCode = Codes.UNAUTHORIZED;
    let message = "Authentication failed";


    /**
     * Handle specific JWT errors:
     * - `TokenExpiredError`: Token is no longer valid.
     * - `JsonWebTokenError`: Token is malformed or incorrect.
     */
    if (error.name === "TokenExpiredError") {
      message = "Token has expired";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token format";
    }

        // Return the appropriate error response
    return ResponseHandler.sendError(set, error, statusCode, message);
  }
};
