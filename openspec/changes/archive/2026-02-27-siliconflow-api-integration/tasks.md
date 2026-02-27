## 1. Setup Dependencies

- [x] 1.1 Install ai-sdk and @ai-sdk/openai packages in frontend
- [x] 1.2 Install required Rust dependencies for HTTP client
- [x] 1.3 Add Siliconflow environment variable configuration
- [x] 1.4 Update TypeScript types for LLM service

## 2. Core LLM Service Implementation

- [x] 2.1 Create LLM service structure in src-tauri/src/services/llm_service.rs
- [x] 2.2 Implement LLM client initialization with Siliconflow provider
- [x] 2.3 Add configuration management for API settings (backend only)
- [x] 2.4 Implement chat completion request handler
- [x] 2.5 Add streaming response support
- [x] 2.6 Implement error handling and retry logic

## 3. Tauri Commands Integration

- [x] 3.1 Create chat completion Tauri command
- [x] 3.2 Create streaming chat completion command
- [x] 3.3 Add configuration endpoint (get_llm_config only, no set_llm_config)
- [x] 3.4 Add connection test endpoint
- [x] 3.5 Add command error handling

## 4. Frontend LLM Service

- [x] 4.1 Create LLM service in src/services/llm.ts
- [x] 4.2 Implement ai-sdk OpenAI provider wrapper using proper Tauri API (@tauri-apps/api/core)
- [x] 4.3 Add chat completion methods (non-streaming)
- [x] 4.4 Implement streaming response handling
- [x] 4.5 Add error handling and loading states
- [x] 4.6 Remove set_llm_config - configuration managed by backend only
- [x] 4.7 Remove AI-specific functions (categorizeExpense, generateFinancialInsights)

## 5. Testing and Validation

- [x] 5.1 Write unit tests for LLM service
- [x] 5.2 Test error handling scenarios
- [x] 5.3 Test streaming response functionality
- [x] 5.4 Test configuration management

## 6. Documentation and Configuration

- [x] 6.1 Update environment configuration documentation
- [x] 6.2 Add API key setup instructions
- [x] 6.3 Document proper usage of invoke from @tauri-apps/api/core
- [x] 6.4 Document that LLM service provides generic API only
