// Safety and validation utility functions
import { supabase } from '../config/supabaseClient';

// Keywords and patterns for content safety checking
const SAFETY_KEYWORDS = {
  inappropriate: [
    'hate', 'violence', 'discrimination', 'harassment', 'abuse', 
    'offensive', 'inappropriate', 'explicit', 'harmful'
  ],
  suspicious: [
    'fake', 'scam', 'fraud', 'misleading', 'spam', 'phishing',
    'malicious', 'virus', 'hack', 'illegal'
  ],
  professional: [
    'unprofessional', 'inappropriate', 'vulgar', 'offensive'
  ]
};

// Check content safety and ethics
export const checkContentSafety = (item) => {
  if (!item) return 'safe';

  // Combine all text fields for analysis
  const textFields = [
    item.title, item.name, item.description, item.content, 
    item.message, item.question, item.answer, item.skills,
    item.technologies, item.bio, item.details
  ].filter(Boolean).join(' ').toLowerCase();

  // Check for inappropriate content
  const hasInappropriate = SAFETY_KEYWORDS.inappropriate.some(keyword => 
    textFields.includes(keyword)
  );

  const hasSuspicious = SAFETY_KEYWORDS.suspicious.some(keyword => 
    textFields.includes(keyword)
  );

  const hasUnprofessional = SAFETY_KEYWORDS.professional.some(keyword => 
    textFields.includes(keyword)
  );

  // Additional checks
  const hasExcessiveCapitals = textFields.length > 10 && 
    (textFields.match(/[A-Z]/g) || []).length / textFields.length > 0.3;

  const hasExcessivePunctuation = (textFields.match(/[!?]{2,}/g) || []).length > 0;

  const isEmpty = textFields.trim().length < 10;

  // Determine safety status
  if (hasInappropriate || hasSuspicious) {
    return 'flagged';
  }

  if (hasUnprofessional || hasExcessiveCapitals || hasExcessivePunctuation || isEmpty) {
    return 'warning';
  }

  return 'safe';
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate URL format
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Check if content length is appropriate
export const validateContentLength = (content, minLength = 10, maxLength = 5000) => {
  if (!content) return false;
  const length = content.trim().length;
  return length >= minLength && length <= maxLength;
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid date';
  }
};

// Get table-specific validation rules
export const getTableValidationRules = (tableName) => {
  const rules = {
    project_of: {
      required: ['title', 'description'],
      optional: ['technologies', 'skills', 'user_id']
    },
    organizations: {
      required: ['name', 'description'],
      optional: ['website', 'email', 'location']
    },
    profiles: {
      required: ['name', 'email'],
      optional: ['bio', 'skills', 'location']
    },
    creative_skills: {
      required: ['skill_name', 'description'],
      optional: ['category', 'level']
    },
    interview_questions: {
      required: ['question'],
      optional: ['answer', 'category', 'difficulty']
    },
    feedback: {
      required: ['message'],
      optional: ['rating', 'category', 'user_id']
    },
    user_activities: {
      required: ['activity_type'],
      optional: ['description', 'timestamp']
    },
    user_selection: {
      required: ['selection_type'],
      optional: ['details', 'preferences']
    }
  };

  return rules[tableName] || { required: [], optional: [] };
};

// Validate item based on table rules
export const validateItem = (item, tableName) => {
  const rules = getTableValidationRules(tableName);
  const errors = [];

  // Check required fields
  rules.required.forEach(field => {
    if (!item[field] || item[field].trim().length === 0) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate email if present
  if (item.email && !validateEmail(item.email)) {
    errors.push('Invalid email format');
  }

  // Validate URL if present
  if (item.website && !validateURL(item.website)) {
    errors.push('Invalid website URL');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Check for duplicate content
export const checkForDuplicates = async (item, tableName, excludeId = null) => {
  try {
    let query = supabase.from(tableName).select('id, title, name, description');
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    
    if (error) throw error;

    const itemTitle = item.title || item.name || '';
    const itemDescription = item.description || '';

    const duplicates = data.filter(existing => {
      const existingTitle = existing.title || existing.name || '';
      const existingDescription = existing.description || '';

      // Check for exact title match
      if (itemTitle && existingTitle && 
          itemTitle.toLowerCase().trim() === existingTitle.toLowerCase().trim()) {
        return true;
      }

      // Check for very similar descriptions (simple similarity check)
      if (itemDescription && existingDescription && 
          itemDescription.length > 50 && existingDescription.length > 50) {
        const similarity = calculateSimpleSimilarity(
          itemDescription.toLowerCase(),
          existingDescription.toLowerCase()
        );
        return similarity > 0.8;
      }

      return false;
    });

    return duplicates;
  } catch (error) {
    console.error('Error checking duplicates:', error);
    return [];
  }
};

// Simple text similarity calculation
const calculateSimpleSimilarity = (text1, text2) => {
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};

// Log safety actions
export const logSafetyAction = async (action, itemId, tableName, details = '') => {
  try {
    const { error } = await supabase
      .from('safety_logs') // Assuming you might want to create this table
      .insert({
        action,
        item_id: itemId,
        table_name: tableName,
        details,
        timestamp: new Date().toISOString(),
        admin_id: 'safety_system' // You can replace with actual admin ID
      });

    if (error && error.code !== '42P01') { // Ignore table doesn't exist error
      console.error('Error logging safety action:', error);
    }
  } catch (error) {
    console.error('Error logging safety action:', error);
  }
};

// Batch delete functionality
export const batchDeleteItems = async (items) => {
  const results = [];
  
  for (const item of items) {
    try {
      const { error } = await supabase
        .from(item.table_name)
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      results.push({ success: true, item });
      await logSafetyAction('DELETE', item.id, item.table_name, 'Batch deletion');
    } catch (error) {
      results.push({ success: false, item, error: error.message });
    }
  }

  return results;
};

// Export all functions
export default {
  checkContentSafety,
  validateEmail,
  validateURL,
  validateContentLength,
  formatDate,
  getTableValidationRules,
  validateItem,
  checkForDuplicates,
  logSafetyAction,
  batchDeleteItems
};