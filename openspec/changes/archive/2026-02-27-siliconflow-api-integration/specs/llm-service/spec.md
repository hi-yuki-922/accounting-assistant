## ADDED Requirements

### Requirement: Initialize LLM Service
The system SHALL initialize an LLM service instance using ai-sdk with Siliconflow provider. This is a generic LLM service that provides only basic chat completion capabilities without business-specific logic.

#### Scenario: Successful service initialization
- **WHEN** the application starts
- **THEN** the LLM service SHALL be initialized with proper configuration from the Rust backend
- **AND** the service SHALL validate the API key and endpoint connectivity

### Requirement: Configure LLM Provider
The system SHALL support configuration of Siliconflow API parameters managed by the Rust backend.

#### Scenario: Configure with environment variables
- **WHEN** environment variables SILICONFLOW_API_KEY and SILICONFLOW_BASE_URL are set
- **THEN** the Rust backend SHALL use these values for configuration
- **AND** the frontend SHALL read configuration via Tauri command `get_llm_config`

#### Scenario: Handle missing configuration
- **WHEN** required configuration is missing
- **THEN** the service SHALL log an error
- **AND** the application SHALL continue running with limited LLM capabilities

### Requirement: Create LLM Client
The system SHALL create an LLM client instance with specified model and parameters.

#### Scenario: Create client with default settings
- **WHEN** creating a new LLM client
- **THEN** it SHALL use the default Siliconflow model (Qwen-7B-Chat)
- **AND** it SHALL configure appropriate temperature and max tokens

#### Scenario: Create client with custom parameters
- **WHEN** custom model, temperature, and max tokens are specified
- **THEN** the client SHALL use these parameters
- **AND** it SHALL validate parameter ranges

### Requirement: Execute Chat Completion
The system SHALL execute chat completion requests with proper error handling.

#### Scenario: Successful chat completion
- **WHEN** a valid chat request is made
- **THEN** the system SHALL send the request to Siliconflow
- **AND** it SHALL return the response content
- **AND** it SHALL track usage statistics

#### Scenario: Handle API rate limiting
- **WHEN** Siliconflow returns a rate limit error
- **THEN** the system SHALL retry with exponential backoff
- **AND** it SHALL respect the retry-after header if present

#### Scenario: Handle network errors
- **WHEN** a network error occurs during the request
- **THEN** the system SHALL retry up to 3 times
- **AND** it SHALL return a clear error message after final failure

### Requirement: Stream Chat Completion
The system SHALL support streaming chat completion responses.

#### Scenario: Successful streaming response
- **WHEN** a streaming chat request is made
- **THEN** the system SHALL return a readable stream
- **AND** each chunk SHALL contain partial response data
- **AND** the stream SHALL complete when all data is received

#### Scenario: Handle streaming errors
- **WHEN** an error occurs during streaming
- **THEN** the system SHALL close the stream gracefully
- **AND** it SHALL return an appropriate error message

### Requirement: Track Usage Metrics
The system SHALL track API usage for monitoring and cost management.

#### Scenario: Record successful API call
- **WHEN** an API call completes successfully
- **THEN** the system SHALL record the model, tokens used, and response time
- **AND** it SHALL update usage statistics

#### Scenario: Track failed attempts
- **WHEN** an API call fails
- **THEN** the system SHALL record the error type and timestamp
- **AND** it SHALL update failure statistics

### Requirement: Use Proper Tauri API
The frontend SHALL use the proper Tauri API from `@tauri-apps/api/core` for invoking backend commands.

#### Scenario: Invoke backend commands
- **WHEN** the frontend needs to call a Tauri command
- **THEN** it SHALL use the `invoke` function from `@tauri-apps/api/core`
- **AND** it SHALL NOT use `window.__TAURI_INVOKE__`

#### Scenario: Configuration access
- **WHEN** the frontend needs LLM configuration
- **THEN** it SHALL call the `get_llm_config` command via invoke
- **AND** it SHALL NOT attempt to set configuration (no `set_llm_config`)

### Requirement: Generic LLM Service Only
The LLM service SHALL provide only generic API interfaces without business-specific functionality.

#### Scenario: Service scope
- **WHEN** implementing the LLM service
- **THEN** it SHALL provide only chat completion (streaming and non-streaming)
- **AND** it SHALL NOT include expense categorization logic
- **AND** it SHALL NOT include financial insights generation
- **AND** it SHALL NOT implement any business-specific AI features
