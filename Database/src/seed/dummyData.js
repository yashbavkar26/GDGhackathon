const users = [
  {
    name: 'Ravi Patil',
    email: 'ravi.farmer@example.com',
    role: 'farmer',
    village: 'Kolhapur'
  },
  {
    name: 'Sneha Deshmukh',
    email: 'sneha.expert@example.com',
    role: 'expert',
    village: 'Sangli'
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    village: 'Pune'
  }
];

const diseaseReports = [
  {
    cropName: 'Tomato',
    diseaseName: 'Early Blight',
    severity: 'medium',
    spreadRisk: 'moderate in humid weather',
    confidence: 0.82,
    location: 'Kolhapur'
  },
  {
    cropName: 'Potato',
    diseaseName: 'Late Blight',
    severity: 'high',
    spreadRisk: 'high during rainy weeks',
    confidence: 0.91,
    location: 'Satara'
  },
  {
    cropName: 'Chili',
    diseaseName: 'Leaf Curl',
    severity: 'low',
    spreadRisk: 'localized field spread',
    confidence: 0.74,
    location: 'Sangli'
  }
];

module.exports = { users, diseaseReports };
