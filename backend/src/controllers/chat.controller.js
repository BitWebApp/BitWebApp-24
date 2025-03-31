import { Chat } from "../models/chat.model.js";
import { Group } from "../models/group.model.js";

const checkMembership = (group, senderId) => {
  return (
    (group.leader && group.leader.toString() === senderId.toString()) ||
    (group.members &&
      group.members.some((m) => m.toString() === senderId.toString())) ||
    (group.summerAppliedProfs &&
      group.summerAppliedProfs.some((p) => p.toString() === senderId.toString())) ||
    (group.summerAllocatedProf &&
      group.summerAllocatedProf.toString() === senderId.toString())
  );
};

export const getChat = async (req, res) => {
  try {
    const { groupId } = req.params;
    let senderId;

    if (req.user) {
      senderId = req.user._id;
    } else if (req.professor) {
      senderId = req.professor._id;
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const group = await Group.findOne({ groupId:groupId });
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (!checkMembership(group, senderId)) {
      return res
        .status(403)
        .json({ error: "Not authorized to access this group's chat" });
    }

    const chat = await Chat.findOne({ groupId:groupId }).populate(
      "messages.sender"
    );
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

