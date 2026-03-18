import { Chat } from "../models/chat.model.js";
import { Group } from "../models/group.model.js";

const checkMembership = (group, senderId) => {
  const sId = senderId.toString();
  return (
    (group.leader && group.leader.toString() === sId) ||
    (group.members &&
      group.members.some((m) => m.toString() === sId)) ||
    (group.summerAppliedProfs &&
      group.summerAppliedProfs.some((p) => p.toString() === sId)) ||
    (group.summerAllocatedProf &&
      group.summerAllocatedProf.toString() === sId) ||
    (group.minorAllocatedProf && 
      group.minorAllocatedProf.toString() === sId) ||
    (group.majorAllocatedProf && 
      group.majorAllocatedProf.toString() === sId)
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

    const group = await Group.findOne({ groupId: groupId });
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (!checkMembership(group, senderId)) {
      console.log("Chat Authorization failed for group:", groupId, "senderId:", senderId);
      console.log("Group Data:", group);
      return res
        .status(403)
        .json({ error: "Not authorized to access this group's chat" });
    }

    const chat = await Chat.findOne({ groupId: groupId }).populate(
      "messages.sender"
    );
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    res.status(200).json(chat);
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
