import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { options } from "../utils/cookieOptions.js";
import cloudinary from "../utils/cloudinary.js";

const generateToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const token = user.generateToken();
    return token;
  } catch (error) {
    console.log("generating token error :", error);

    throw error;
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;
  //   console.log(req.body);

  if ([email, password, fullName].some((field) => field?.trim() === "")) {
    return res.status(400).json({ message: "all fields are required" });
  }

  if (password && password.length < 8) {
    return res
      .status(400)
      .json({ message: "password length must be greater than 8" });
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    return res
      .status(409)
      .json({ message: "User with this email already exist" });
  }

  const user = await User.create({
    fullName,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    return res
      .status(500)
      .json({ message: "Something went wrong while registering user" });
  }

  const token = await generateToken(createdUser._id);

  return res
    .status(201)
    .cookie("token", token, options)
    .json({ createdUser, message: "User created Successfully !" });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = await generateToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .cookie("token", token, options)
    .json({ loggedInUser, message: "Logged in successfully !" });
});

const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
    })
    .json({ message: "User logged out successfully" });
});

const uploadProfilePic = asyncHandler(async (req, res) => {
  try {
    const { profilePic } = req.body;

    // console.log("Profile Pic : ", profilePic);
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const user = await User.findById(req.user._id);

    if (user.cloudinaryPublicId) {
      try {
        const result = await cloudinary.uploader.destroy(
          user.cloudinaryPublicId
        );
        console.log("Old profile pic deleted from cloudinary ", result);
      } catch (error) {
        console.log("Error while deleting old profile pic: ", error);
      }
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      resource_type: "auto",
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        cloudinaryPublicId: uploadResponse.public_id,
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ updatedUser, message: "Profile pic uploaded successfully" });
  } catch (error) {
    console.log("cloudinary uplaod error :: ", error);
    return res
      .status(500)
      .json({ message: "error while uploading on cloudinary" });
  }
});

const checkAuth = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  return res.status(200).json(req.user);
});

export { registerUser, loginUser, logoutUser, uploadProfilePic, checkAuth };
