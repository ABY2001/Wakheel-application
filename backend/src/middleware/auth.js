import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Support mock / development tokens
      if (
        token === "advocate_token" ||
        token === "adv_token" ||
        (process.env.USE_DUMMY_DATA === "true" && token.startsWith("adv_"))
      ) {
        req.user = {
          _id: "adv_1",
          id: "adv_1",
          fullName: "Adv. Meera Krishnan",
          email: "meera.krishnan@wakheel.law",
          role: "advocate",
          barCouncilNumber: "K/001429/2012",
        };
        return next();
      }

      if (token === "dev_token" || (process.env.USE_DUMMY_DATA === "true" && token.startsWith("dev_"))) {
        req.user = {
          _id: "default_citizen",
          id: "default_citizen",
          fullName: "Gopakumar Nambiar",
          email: "gopakumar@test.com",
          role: "citizen",
        };
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "wakheel_secret_key");

      if (decoded.id) {
        try {
          req.user = await User.findById(decoded.id).select("-password");
        } catch {
          // Ignore CastError if ID is string/devStore
        }
      }

      if (!req.user) {
        const devUsers = (await import("../utils/devStore.js")).devStore.getUsers();
        req.user = devUsers.find((u) => u._id === decoded.id || u.email === decoded.email);
        if (req.user) {
          const { password: _, ...userWithoutPass } = req.user;
          req.user = userWithoutPass;
        }
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found with this token",
        });
      }

      next();
    } catch (error) {
      if (process.env.USE_DUMMY_DATA === "true") {
        if (token && (token.includes("adv") || req.baseUrl?.includes("advocate") || req.originalUrl?.includes("advocate"))) {
          req.user = {
            _id: "adv_1",
            id: "adv_1",
            fullName: "Adv. Meera Krishnan",
            email: "meera.krishnan@wakheel.law",
            role: "advocate",
            barCouncilNumber: "K/001429/2012",
          };
        } else {
          req.user = {
            _id: "default_citizen",
            id: "default_citizen",
            fullName: "Gopakumar Nambiar",
            email: "gopakumar@test.com",
            role: "citizen",
          };
        }
        return next();
      }
      console.error("Auth Middleware Error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token verification failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no Bearer token provided",
    });
  }
};
