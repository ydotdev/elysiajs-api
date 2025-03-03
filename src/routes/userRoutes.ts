import { Elysia } from "elysia";
import { createUsers, deleteUsers, getUsers, updateUsers, getJWT_Token } from "../controllers/userController"; // Import user controller functions
import { config } from "dotenv";
import { authMiddleware } from "../middlewares/authMiddleware";

config(); // Load environment variables

/**
 * Defines user routes for the application.
 *
 * @param {Elysia} app - The Elysia application instance.
 * @returns {Elysia} - The modified application instance with user routes.
 */
export const userRoutes = (app: Elysia): Elysia => {
  return app
    /**
     * Route for creating a new user.
     *
     * @route POST /create
     * @handler createUsers - Handles the creation of a user.
     */
    
    .post('/token', getJWT_Token)

    .post("/create", createUsers)

    /**
     * Route for retrieving users.
     *
     * @route GET /
     * @handler getUsers - Handles the retrieval of users.
     */
    .get("/get",getUsers, {beforeHandle: authMiddleware})

    /**
     * Route for updating a user.
     *
     * @route PUT /
     * @handler updateUsers - Handles the update of a user.
     * @queryParam id - The ID of the user to update.
     */
    .put("/update/", updateUsers)

    /**
     * Route for deleting a user.
     *
     * @route DELETE /:id
     * @handler deleteUsers - Handles the deletion of a user.
     * @param id - The ID of the user to delete (as a path parameter).
     */
    .delete("/delete/", deleteUsers);

};