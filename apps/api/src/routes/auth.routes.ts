import { Router } from "express";
import { registerController,  loginController, logoutController, getMeController,} from "../controllers/auth.controller.js";
import { authenticateUser} from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/profile", authenticateUser, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authenticated successfully",
    data: {
      user: (req as import("../middleware/auth.middleware.js").AuthenticatedRequest).user,
    },
  });
});
router.post("/logout", logoutController);
router.get("/me", authenticateUser, getMeController);

export default router;