import { Context } from "elysia"; // Import Context from Elysia
import { Codes, Messages } from "../utils/httpCodesAndMessages"; // Adjust path as needed
import ResponseHandler from "../utils/ResponseHandler"; // Adjust path as needed
import userModel from "../models/userModel"; // Adjust path as needed and rename to camelCase

interface CustomContext extends Context {
  body: any; 
  params: { id?: string };
  query: { id?: string; page?: string };
  set: any;
  jwt: any;
}
export const createUsers = async ({ body, set }: CustomContext) => {
  try {
    if (!body.emailField) {
      set.status = Codes.BAD_REQUEST;
      return ResponseHandler.sendError(set, "Email is required.", Codes.BAD_REQUEST, Messages.VALIDATION_ERROR);
    }

    const existingUser = await userModel.findOne({ emailField: body.emailField });

    if (existingUser) {
      set.status = Codes.CONFLICT;
      return ResponseHandler.sendError(set, "Email already exists.", Codes.CONFLICT, Messages.EMAIL_ALREADY_EXISTS);
    }

    const newUser = new userModel(body);
    const result = await newUser.save();
    return ResponseHandler.sendSuccess(set, result, Codes.CREATED, Messages.DATA_CREATED_SUCCESS);
  } catch (error: any) {
    console.error("Error creating user:", error);
    set.status = Codes.INTERNAL_SERVER_ERROR;
    return ResponseHandler.sendError(set, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
  }
};
export const getJWT_Token = async ({ body, jwt, set }: CustomContext) => {
      const { username, password } = body;

      // Example user validation (replace with DB validation)
      if (username !== "admin" || password !== "password") {
        return ResponseHandler.sendError(set, 400, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);

      } 
      // Generate JWT Token
      const token = await jwt.sign({ username });

      return {
        message: "Login successful",
        token,
      };
    }


export const getUsers = async ({ query, set}: CustomContext) => {
  try {
    if (query.id) {
      const result = await userModel.findById(query.id);
      if (!result) {
        set.status = Codes.NOT_FOUND;
        return ResponseHandler.sendError(set, Error, Codes.NOT_FOUND, Messages.NOT_FOUND);
      }
      return ResponseHandler.sendSuccess(set, result, Codes.OK, Messages.DATA_RETRIEVED_SUCCESS);
    } else {
      const page = Number(query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      const result = await userModel.find().skip(skip).limit(limit);
      const totalItem = await userModel.countDocuments();
      const totalPages = Math.ceil(totalItem / limit);
      const results = { result, totalPages };
      return ResponseHandler.sendSuccess(set, results, Codes.OK, Messages.DATA_RETRIEVED_SUCCESS);
    }
  } catch (error) {
    console.error("Error getting users:", error);
    set.status = Codes.INTERNAL_SERVER_ERROR;
    return ResponseHandler.sendError(set, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
  }
};

export const updateUsers = async ({ query, body, set }: CustomContext) => {
  try {
    if (query.id) {
      const result = await userModel.findByIdAndUpdate(query.id, body, { new: true });
      if (!result) {
        set.status = Codes.NOT_FOUND;
        return ResponseHandler.sendError(set, "no user Found", Codes.NOT_FOUND, Messages.NOT_FOUND);
      }
      return ResponseHandler.sendSuccess(set, result, Codes.OK, Messages.DATA_UPDATED_SUCCESS);
    } else {
      set.status = Codes.BAD_REQUEST;
      return ResponseHandler.sendError(set, "Bad Request", Codes.BAD_REQUEST, Messages.BAD_REQUEST);
    }
  } catch (error) {
    console.error("Error updating user:", error);
    set.status = Codes.INTERNAL_SERVER_ERROR;
    return ResponseHandler.sendError(set, error , Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
  }
};

export const deleteUsers = async ({ query, set }: CustomContext) => {
  try {
    if (query.id) {
      const result = await userModel.findByIdAndDelete(query.id);
      if (!result) {
        set.status = Codes.NOT_FOUND;
        return ResponseHandler.sendError(set, "No user found to delete", Codes.NOT_FOUND, Messages.NOT_FOUND);
      }
      return ResponseHandler.sendSuccess(set, result, Codes.OK, Messages.DATA_DELETED_SUCCESS);
    } else {
      set.status = Codes.BAD_REQUEST;
      return ResponseHandler.sendError(set, "cant delete user", Codes.BAD_REQUEST, Messages.BAD_REQUEST);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    set.status = Codes.INTERNAL_SERVER_ERROR;
    return ResponseHandler.sendError(set, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
  }
};