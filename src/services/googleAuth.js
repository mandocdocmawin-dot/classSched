// src/services/googleAuth.js

/**
 * Initiates the Google OAuth 2.0 login flow.
 * Returns a placeholder token for now.
 */
export const loginWithGoogle = async () => {
  console.log("Initiating Google Login...");
  // TODO: Implement actual Google OAuth logic here
  return {
    token: "placeholder_oauth_token",
    user: { email: "student@edu.ph", name: "BSIS Student" }
  };
};

/**
 * Validates if the email is a valid .edu account.
 */
export const isEduAccount = (email) => {
  return email.endsWith('.edu.ph') || email.endsWith('.edu');
};