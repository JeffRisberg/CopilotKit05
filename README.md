# Chat with your data

Transform your data visualization experience with an AI-powered dashboard assistant. 
Ask questions about your data in natural language, get insights, and interact with 
your metrics—all through a conversational interface powered by CopilotKit.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root and add your [OpenAI API Key](https://platform.openai.com/api-keys) and [Tavily API Key](https://tavily.com/api-key):
   ```
   OPENAI_API_KEY=your_openai_api_key
   TAVILY_API_KEY=your_tavily_api_key
   ```

3. Start the server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Query Parameters

The application supports the following optional query parameters:

- `openCopilot=true` - Automatically opens the CopilotKit sidebar when the page loads
  - Example: `http://localhost:3000?openCopilot=true`

## 🧩 How It Works

This demo showcases several powerful CopilotKit features:

### CopilotKit Provider
This provides the chat context to all of the children components.

<em>[app/layout.tsx](./app/layout.tsx)</em>

```tsx
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CopilotKit runtimeUrl="/api/copilotkit">
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
```

### CopilotReadable
This makes your dashboard data available to the AI, allowing it to understand and analyze your metrics in real-time.

<em>[components/Dashboard.tsx](./components/Dashboard.tsx)</em>

```tsx
useCopilotReadable({
  description: "Dashboard data including sales trends, product performance, and category distribution",
  value: {
    salesData,
    productData,
    categoryData,
    regionalData,
    demographicsData,
    metrics: {
      totalRevenue,
      totalProfit,
      totalCustomers,
      conversionRate,
      averageOrderValue,
      profitMargin
    }
  }
});
```

### Backend Actions
Backend actions are used to handle operations that require secure server-side processing. This allows you to
still let the LLM talk to your data, even when it needs to be secured.

<em>[app/api/copilotkit/route.ts](./app/api/copilotkit/route.ts)</em>

```ts
const runtime = new CopilotRuntime({
  actions: ({properties, url}) => {
    return [
      {
        name: "searchInternet",
        description: "Searches the internet for information.",
        parameters: [
          {
            name: "query",
            type: "string",
            description: "The query to search the internet for.",
            required: true,
          },
        ],
        handler: async ({query}: {query: string}) => {
          // can safely reference sensitive information like environment variables
          const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
          return await tvly.search(query, {max_results: 5});
        },
      },
    ]
  }
});
```

You can even render these backend actions safely in the frontend.

<em>[components/Dashboard.tsx](./components/Dashboard.tsx)</em>

```tsx
useCopilotAction({
  name: "searchInternet",
  available: "disabled",
  description: "Searches the internet for information.",
  parameters: [
    {
      name: "query",
      type: "string",
      description: "The query to search the internet for.",
      required: true,
    }
  ],
  render: ({args, status}) => {
    return <SearchResults query={args.query || 'No query provided'} status={status} />;
  }
});
```

### CopilotSidebar
The CopilotSidebar component provides a chat interface for users to interact with the AI assistant. It's customized with specific labels and instructions to provide a data-focused experience.

<em>[app/page.tsx](./app/page.tsx)</em>

```tsx
<CopilotSidebar
  instructions={prompt}
  AssistantMessage={CustomAssistantMessage}
  labels={{
    title: "Data Assistant",
    initial: "Hello, I'm here to help you understand your data. How can I help?",
    placeholder: "Ask about sales, trends, or metrics...",
  }}
/>
```

### Custom Assistant Message
The dashboard uses a custom assistant message component to style the AI responses to match the dashboard's design system.

<em>[components/AssistantMessage.tsx](./components/AssistantMessage.tsx)</em>

```tsx
export const CustomAssistantMessage = (props: AssistantMessageProps) => {
  const { message, isLoading, subComponent } = props;

  return (
    <div className="pb-4">
      {(message || isLoading) && 
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {message && <Markdown content={message} />}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-blue-500">
                <Loader className="h-3 w-3 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>
        </div>
      }
      
      {subComponent && <div className="mt-2">{subComponent}</div>}
    </div>
  );
};
```
