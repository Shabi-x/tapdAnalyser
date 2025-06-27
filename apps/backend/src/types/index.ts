import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface MCPTool {
    name: string;
    description?: string;
    inputSchema: {
        type: "object";
        properties?: Record<string, unknown>;
        required?: string[];
    };
}

export interface MCPTextContent {
    [key: string]: unknown;
    type: "text";
    text: string;
    _meta?: Record<string, unknown>;
}

export interface MCPResponse {
    [key: string]: unknown;
    content: MCPTextContent[];
    _meta?: Record<string, unknown>;
    structuredContent?: Record<string, unknown>;
    isError?: boolean;
}

export type { ChatCompletionMessageParam }; 