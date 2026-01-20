/**
 * Tests for auth environment variable handling
 */
import { describe, test, expect, beforeEach } from 'bun:test';
import { setAuthEnvironment, clearAuthEnvironment } from '../env.ts';

describe('setAuthEnvironment', () => {
  beforeEach(() => {
    // Clear env vars before each test
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
    delete process.env.AWS_REGION;
    delete process.env.AWS_DEFAULT_REGION;
    delete process.env.AWS_PROFILE;
  });

  test('sets API key for api_key auth type', () => {
    setAuthEnvironment({
      type: 'api_key',
      credentials: { apiKey: 'test-api-key' },
    });

    expect(process.env.ANTHROPIC_API_KEY).toBe('test-api-key');
    expect(process.env.CLAUDE_CODE_OAUTH_TOKEN).toBeUndefined();
  });

  test('sets OAuth token for oauth_token auth type', () => {
    setAuthEnvironment({
      type: 'oauth_token',
      credentials: { oauthToken: 'test-oauth-token' },
    });

    expect(process.env.CLAUDE_CODE_OAUTH_TOKEN).toBe('test-oauth-token');
    expect(process.env.ANTHROPIC_API_KEY).toBeUndefined();
  });

  test('sets AWS env vars for bedrock_env auth type', () => {
    setAuthEnvironment({
      type: 'bedrock_env',
      credentials: {
        awsRegion: 'us-east-1',
        awsProfile: 'my-profile',
      },
    });

    expect(process.env.AWS_REGION).toBe('us-east-1');
    expect(process.env.AWS_DEFAULT_REGION).toBe('us-east-1');
    expect(process.env.AWS_PROFILE).toBe('my-profile');
    expect(process.env.ANTHROPIC_API_KEY).toBeUndefined();
    expect(process.env.CLAUDE_CODE_OAUTH_TOKEN).toBeUndefined();
  });

  test('sets AWS region only when awsProfile is not provided', () => {
    setAuthEnvironment({
      type: 'bedrock_env',
      credentials: {
        awsRegion: 'us-west-2',
      },
    });

    expect(process.env.AWS_REGION).toBe('us-west-2');
    expect(process.env.AWS_DEFAULT_REGION).toBe('us-west-2');
    expect(process.env.AWS_PROFILE).toBeUndefined();
  });

  test('does not set AWS vars when credentials are empty', () => {
    setAuthEnvironment({
      type: 'bedrock_env',
      credentials: {},
    });

    expect(process.env.AWS_REGION).toBeUndefined();
    expect(process.env.AWS_DEFAULT_REGION).toBeUndefined();
    expect(process.env.AWS_PROFILE).toBeUndefined();
  });

  test('clears conflicting auth vars when switching auth types', () => {
    // Set API key first
    setAuthEnvironment({
      type: 'api_key',
      credentials: { apiKey: 'test-api-key' },
    });

    expect(process.env.ANTHROPIC_API_KEY).toBe('test-api-key');

    // Switch to Bedrock
    setAuthEnvironment({
      type: 'bedrock_env',
      credentials: { awsRegion: 'us-east-1' },
    });

    // API key should be cleared
    expect(process.env.ANTHROPIC_API_KEY).toBeUndefined();
    expect(process.env.AWS_REGION).toBe('us-east-1');
  });
});

describe('clearAuthEnvironment', () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    process.env.CLAUDE_CODE_OAUTH_TOKEN = 'test-token';
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_PROFILE = 'test-profile';
  });

  test('clears Anthropic auth vars but preserves AWS vars', () => {
    clearAuthEnvironment();

    expect(process.env.ANTHROPIC_API_KEY).toBeUndefined();
    expect(process.env.CLAUDE_CODE_OAUTH_TOKEN).toBeUndefined();
    // AWS vars should be preserved
    expect(process.env.AWS_REGION).toBe('us-east-1');
    expect(process.env.AWS_PROFILE).toBe('test-profile');
  });
});
