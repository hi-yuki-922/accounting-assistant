## Why

The accounting assistant application needs a generic LLM integration capability to enable future AI-powered features. Integrating Siliconflow's LLM API through ai-sdk provides a standardized interface for LLM interactions that can be used for various purposes including expense categorization, financial insights, and natural language queries.

## What Changes

- Add Siliconflow LLM API integration using ai-sdk's OpenAI provider wrapper
- Implement a generic LLM service layer for API interactions
- Add configuration management via Rust backend (read-only for frontend)
- Support both streaming and non-streaming chat completions
- Use proper Tauri API (`@tauri-apps/api/core`) for command invocation

## Capabilities

### New Capabilities
- `llm-service`: Generic LLM service implementation using ai-sdk with Siliconflow provider, providing chat completion and streaming capabilities

### Modified Capabilities
- None

## Impact

- **Frontend**: Components will need to integrate with new AI features
- **Backend**: New LLM service layer and API endpoints
- **Dependencies**: Add ai-sdk, @ai-sdk/openai packages
- **Configuration**: Environment variables for Siliconflow API settings