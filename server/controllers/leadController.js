const Lead = require("../models/Lead");

// Create a new lead
const createLead = async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      createdBy: req.user._id,

      activities: [
        {
          action: "Lead created",
          performedBy: req.user._id,
        },
      ],
    });

    res.status(201).json({
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all leads with pagination and filtering
const getLeads = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filter = {};

    // Members can only see leads assigned to them
    if (req.user.role === "member") {
      filter.assignedTo = req.user._id;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Search leads by name, email, company or phone
    if (req.query.search) {
      const search = req.query.search.trim();

      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Admin can filter leads by assigned member
    if (req.user.role === "admin" && req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }

    const skip = (page - 1) * limit;

    const totalLeads = await Lead.countDocuments(filter);

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      page,
      limit,
      totalLeads,
      totalPages: Math.ceil(totalLeads / limit),
      leads,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get single lead details
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate("notes.addedBy", "name email role")
      .populate("activities.performedBy", "name email role");

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    // Member can only view a lead assigned to them
    if (
      req.user.role === "member" &&
      (!lead.assignedTo ||
        lead.assignedTo._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        message: "You can only view leads assigned to you",
      });
    }

    res.status(200).json({
      lead,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Assign a lead to a member
const assignLead = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    const User = require("../models/User");

    const member = await User.findById(userId);

    if (!member) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (member.role !== "member") {
      return res.status(400).json({
        message: "Lead can only be assigned to a member",
      });
    }

    lead.assignedTo = member._id;

    lead.activities.push({
      action: `Lead assigned to ${member.name}`,
      performedBy: req.user._id,
    });

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate("activities.performedBy", "name email role");

    res.status(200).json({
      message: "Lead assigned successfully",
      lead: updatedLead,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update lead status
const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["new", "contacted", "qualified", "won", "lost"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid lead status",
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    // Member can update only a lead assigned to them
    if (
      req.user.role === "member" &&
      (!lead.assignedTo ||
        lead.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        message: "You can only update leads assigned to you",
      });
    }

    const oldStatus = lead.status;

    lead.status = status;

    lead.activities.push({
      action: `Status changed from ${oldStatus} to ${status}`,
      performedBy: req.user._id,
    });

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate("activities.performedBy", "name email role");

    res.status(200).json({
      message: "Lead status updated successfully",
      lead: updatedLead,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Add note to a lead
const addLeadNote = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Note text is required",
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    // Member can add notes only to their assigned lead
    if (
      req.user.role === "member" &&
      (!lead.assignedTo ||
        lead.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        message: "You can only add notes to leads assigned to you",
      });
    }

    // Add note
    lead.notes.push({
      text: text.trim(),
      addedBy: req.user._id,
    });

    // Add activity
    lead.activities.push({
      action: "Note added",
      performedBy: req.user._id,
    });

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate("assignedTo", "name email role")
      .populate("notes.addedBy", "name email role")
      .populate("activities.performedBy", "name email role");

    res.status(200).json({
      message: "Note added successfully",
      lead: updatedLead,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update lead details
const updateLead = async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    if (name !== undefined) lead.name = name;
    if (email !== undefined) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (company !== undefined) lead.company = company;

    lead.activities.push({
      action: "Lead details updated",
      performedBy: req.user._id,
    });

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate("activities.performedBy", "name email role");

    res.status(200).json({
      message: "Lead updated successfully",
      lead: updatedLead,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a lead
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    await lead.deleteOne();

    res.status(200).json({
      message: "Lead deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  updateLeadStatus,
  addLeadNote,
};
