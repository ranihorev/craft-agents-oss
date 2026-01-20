/**
 * Auth environment variable management
 *
 * Centralizes the pattern of setting/clearing environment variables
 * when switching between authentication modes.
 */

import type { AuthType } from '../config/storage.ts';

export interface ApiKeyCredentials {
  apiKey: string;
}

export interface ClaudeMaxCredentials {
  oauthToken: string;
}

export interface BedrockEnvCredentials {
  awsRegion?: string;
  awsProfile?: string;
}

export type AuthCredentials =
  | { type: 'api_key'; credentials: ApiKeyCredentials }
  | { type: 'oauth_token'; credentials: ClaudeMaxCredentials }
  | { type: 'bedrock_env'; credentials: BedrockEnvCredentials };

/**
 * Set environment variables for the specified auth type.
 *
 * This clears conflicting env vars and sets the appropriate ones
 * for the selected authentication mode.
 *
 * @param auth - The auth type and credentials to configure
 */
export function setAuthEnvironment(auth: AuthCredentials): void {
  // Clear Anthropic auth-related env vars first
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.CLAUDE_CODE_OAUTH_TOKEN;

  switch (auth.type) {
    case 'api_key':
      process.env.ANTHROPIC_API_KEY = auth.credentials.apiKey;
      break;

    case 'oauth_token':
      process.env.CLAUDE_CODE_OAUTH_TOKEN = auth.credentials.oauthToken;
      break;

    case 'bedrock_env':
      // Set AWS environment variables if provided
      if (auth.credentials.awsRegion) {
        process.env.AWS_REGION = auth.credentials.awsRegion;
        process.env.AWS_DEFAULT_REGION = auth.credentials.awsRegion;
      }
      if (auth.credentials.awsProfile) {
        process.env.AWS_PROFILE = auth.credentials.awsProfile;
      }
      // Note: We don't clear AWS env vars when switching away from bedrock_env
      // to preserve user's environment settings
      break;
  }
}

/**
 * Clear all auth-related environment variables.
 * Note: Does not clear AWS env vars to preserve user's environment settings.
 */
export function clearAuthEnvironment(): void {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
  // Intentionally not clearing AWS env vars (AWS_REGION, AWS_DEFAULT_REGION, AWS_PROFILE)
  // to preserve user's environment configuration
}
