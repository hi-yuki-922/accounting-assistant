## Context

The accounting assistant application currently has a Tauri 2.0 backend with Vue 3 frontend and uses SQLite for data storage. The application supports basic accounting record management but lacks AI-powered features. The existing architecture follows a service layer pattern with clear separation between commands, services, and database access.

## Goals / Non-Goals

**Goals:**
- Implement a reusable generic LLM service using ai-sdk with Siliconflow provider
- Provide chat completion (non-streaming and streaming) capabilities
- Maintain existing architecture without breaking changes
- Keep configuration management in Rust backend (read-only access for frontend)
- Use proper Tauri API for command invocation

**Non-Goals:**
- Modify existing database schema
- Implement user authentication system
- Create complex AI training or fine-tuning capabilities
- Support multiple LLM providers beyond Siliconflow
- Implement business logic-specific AI features (expense categorization, financial insights) in this LLM service module

## Decisions

**1. ai-sdk with OpenAI Provider Wrapper**
- **Rationale**: ai-sdk provides a clean interface and handles authentication, retries, and streaming. Using the OpenAI provider wrapper allows easy migration to other providers if needed.
- **Alternative**: Direct HTTP requests to Siliconflow API would require more boilerplate code.

**2. Separate Service Layer**
- **Rationale**: Follow existing architectural pattern by creating a dedicated `llm_service` in the backend service layer.
- **Alternative**: Embed LLM logic in existing services would violate separation of concerns.

**3. Frontend Integration via Commands**
- **Rationale**: Use existing Tauri IPC command pattern for frontend-backend communication.
- **Alternative**: Direct frontend API calls would bypass the backend's business logic layer.

**4. Streaming Responses**
- **Rationale**: Provide real-time feedback for long-running AI operations.
- **Alternative**: Simple responses would be faster but less engaging for users.

**5. Configuration via Environment Variables**
- **Rationale**: Standard practice for API keys and sensitive configuration.
- **Alternative**: Hard-coded configuration would be insecure and inflexible.

## Risks / Trade-offs

**[Risk] API rate limiting** → Implement retry logic with exponential backoff
**[Risk] Network connectivity issues** → Add graceful degradation and error handling
**[Risk] Cost management** → Add usage tracking and configurable model selection
**[Risk] Response quality** → Implement prompt engineering and model selection strategies
**[Trade-off] Performance vs Features** → Streaming responses improve UX but add complexity

## Migration Plan

1. **Phase 1**: Implement core LLM service with basic chat completion functionality
2. **Phase 2**: Add streaming response support
3. **Phase 3**: Integrate with frontend using proper Tauri API
4. **Rollback Strategy**: Maintain existing functionality; LLM service is an optional feature that can be disabled via configuration

## Open Questions

1. Which Siliconflow models to use as default? (Qwen-7B-Chat, Qwen-14B-Chat, etc.)
2. Should we implement usage tracking and cost monitoring?
3. What's the budget for API calls during development?