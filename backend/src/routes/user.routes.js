import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  updateUser1,
  updatePlacementOne,
  updatePlacementTwo,
  updatePlacementThree,
  getPlacementDetails,
  getCurrentUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
const router = Router();
router
  .route("/register")
  .post(upload.fields([{ name: "idCard", maxCount: 1 }]), registerUser);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update").patch(verifyJWT, updateUser1);
router.route("/get-user").get(verifyJWT, getCurrentUser);
router
  .route("/pone")
  .patch(
    verifyJWT,
    upload.fields([{ name: "doc", maxCount: 1 }]),
    updatePlacementOne
  );
router
  .route("/ptwo")
  .patch(
    verifyJWT,
    upload.fields([{ name: "doc", maxCount: 1 }]),
    updatePlacementTwo
  );
router
  .route("/pthree")
  .patch(
    verifyJWT,
    upload.fields([{ name: "doc", maxCount: 1 }]),
    updatePlacementThree
  );

router.route("/placementDetails").get(verifyAdmin, getPlacementDetails);

export default router;
