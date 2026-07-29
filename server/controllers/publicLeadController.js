const Lead = require("../models/Lead");

// Public visitor can submit a lead without login
const createPublicLead = async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;

    // Basic validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        message: "Name, email and phone are required",
      });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company: company || "",
      status: "new",
      assignedTo: null,
      createdBy: null,
      activities: [
        {
          action: "Lead submitted through public form",
        },
      ],
    });

    res.status(201).json({
      message: "Thank you! Your enquiry has been submitted successfully.",
      lead: {
        id: lead._id,
        name: lead.name,
        status: lead.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createPublicLead,
};