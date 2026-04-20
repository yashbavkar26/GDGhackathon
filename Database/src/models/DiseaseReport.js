const mongoose = require('mongoose');

const diseaseReportSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true },
    diseaseName: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    spreadRisk: { type: String, default: 'low' },
    confidence: { type: Number, min: 0, max: 1, default: 0.5 },
    location: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.model('DiseaseReport', diseaseReportSchema);
