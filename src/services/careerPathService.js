// Career Path API Service
// Handles all API calls related to career path functionality

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:1441"

/**
 * Create a new career path entry
 * @param {Object} careerData - The career path data
 * @param {string} careerData.user_id - User ID
 * @param {string} careerData.field - Field of interest
 * @param {string} careerData.desired_skills - Skills the user wants to learn
 * @param {string} careerData.confident_skills - Skills the user is confident about
 * @param {string} careerData.suggestion - Career suggestions/recommendations
 * @returns {Promise<Object>} API response
 */
export const createCareerPath = async (careerData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/career-path`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(careerData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating career path:", error)
    throw new Error(`Failed to create career path: ${error.message}`)
  }
}

/**
 * Get career path data for a specific user
 * @param {string} userId - The user ID to fetch career path for
 * @returns {Promise<Object>} Career path data
 */
export const getCareerPath = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }

    const response = await fetch(`${API_BASE_URL}/career-path/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching career path:", error)
    throw new Error(`Failed to fetch career path: ${error.message}`)
  }
}

/**
 * Update an existing career path entry
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} API response
 */
export const updateCareerPath = async (userId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/career-path/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating career path:", error)
    throw new Error(`Failed to update career path: ${error.message}`)
  }
}

/**
 * Delete a career path entry
 * @param {string} userId - User ID
 * @returns {Promise<Object>} API response
 */
export const deleteCareerPath = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/career-path/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error deleting career path:", error)
    throw new Error(`Failed to delete career path: ${error.message}`)
  }
}

// Export all functions as default object for easier importing
export default {
  createCareerPath,
  getCareerPath,
  updateCareerPath,
  deleteCareerPath,
}
