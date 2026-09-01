import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeedbackForm",
      required: true,
      index: true,
    },
    formTitle: {
      type: String,
      required: true,
    },
    bugTitle: {
      type: String,
      default: "",
    },
    bugType: {
      type: String,
      default: "UI",
    },
    severity: {
      type: String,
      default: "Medium",
    },
    bugDescription: {
      type: String,
      required: true,
    },
    stepsToReproduce: {
      type: String,
      default: "",
    },
    environment: {
      type: String,
      default: "",
    },
    reporterEmail: {
      type: String,
      default: "",
    },
    attachments: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["New", "Reviewed", "Accepted", "Rejected"],
      default: "New",
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ userId: 1, status: 1 });

export default mongoose.model("Submission", submissionSchema);
