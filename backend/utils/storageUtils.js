/**
 * Utility functions for handling file storage across environments
 */

// Check if running in a serverless environment
const isServerlessEnvironment = () => {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION);
};

// Function to create a buffer URL for in-memory files
const getBufferUrl = (buffer, mimetype, filename) => {
  // In serverless environments, we need to handle the file differently
  // This is a placeholder - in a real app, you would save to cloud storage
  // and return a URL from there
  
  // For now, return a data URL representation (not ideal for production)
  return `data:${mimetype};name=${filename};base64,${buffer.toString('base64')}`;
};

module.exports = {
  isServerlessEnvironment,
  getBufferUrl
};
