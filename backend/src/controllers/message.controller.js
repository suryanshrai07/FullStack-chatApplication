import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import cloudinary from "../utils/cloudinary.js";
import { getReceiverSocketId,io } from "../utils/socket.js";

const getUserForSidebar = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;

  const filteredUser = await User.find({ _id: { $ne: loggedInUserId } }).select(
    "-password"
  );

  if (!filteredUser.length) {
    return res.status(500).json({ message: "Something went wrong while fetching users" });
  }

  return res
    .status(200)
    .json({ users: filteredUser, message: "All users fetched successfully" });
});

const getMessages = asyncHandler(async (req, res) => {
  const { id: userToChatId } = req.params;
  const myId = req.user._id;

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: userToChatId },
      { senderId: userToChatId, receiverId: myId },
    ],
  });

  res.status(200).json({ messages, message: "All messages fetched" });
});

const sendMessages = asyncHandler(async (req, res) => {
  const { image, text } = req.body;

  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  if (text == "" && !image) {
    return res.status(400).json({ message: "text field is empty !" });
  }

  let imageUrl;
  if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image);
    imageUrl = uploadResponse.secure_url;
  }

  const newMessage = await Message.create({
    senderId,
    receiverId,
    text,
    image: imageUrl,
  });

  if (!newMessage) {
    return res.status(500).json({ message: "Something went wrong while sending message" });
  }


  const recieverSocketId = getReceiverSocketId(receiverId);

  if(recieverSocketId){
    io.to(recieverSocketId).emit("newMessage", newMessage);
  }

  return res
    .status(200)
    .json({ message: "Message sent successfully", newMessage });
});   

export { getUserForSidebar, getMessages , sendMessages };
