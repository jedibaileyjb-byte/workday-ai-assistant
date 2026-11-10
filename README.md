# Workday AI Assistant

Build a modern, responsive SaaS web application called **AI Workplace Productivity Assistant**.

**Design:** Create a premium, professional dashboard with a dark navy background, turquoise-blue accents, clean typography, subtle gradients, rounded cards, and modern icons. Include a collapsible sidebar, top navigation, and responsive layouts for desktop and mobile.

**Core features:**

1. **Smart Email Generator**
   - Generate professional, context-specific emails from user instructions.
   - Tone selection: Formal, Friendly, Persuasive.
   - Fields for recipient, subject, purpose and additional context.
   - Editable output with Copy and Regenerate buttons.

2. **AI Research Assistant**
   - Accept research topics, pasted articles and website URLs.
   - Generate structured summaries, key findings, insights and actionable recommendations.
   - Include a Copy and Edit option.

3. **AI Workplace Chatbot**
   - Interactive chat interface with conversation history during the session.
   - Answer workplace questions, assist with writing, brainstorming, planning and problem-solving.
   - Provide contextual, detailed and relevant responses.

**Functionality:**
- Use structured AI prompts to produce relevant, non-generic responses.
- Integrate an available AI API directly from the frontend using a user-provided API key. No custom backend, database or server required.
- If no API key is configured, display a clear setup message rather than presenting simulated responses as real AI-generated content.
- Allow users to edit, copy and regenerate outputs.
- Include loading indicators, error handling and empty states.
- Store temporary session data locally where appropriate.

**Dashboard:** Include a welcome section, feature cards, quick-access actions and a recent activity section.

**Responsible AI:** Display a disclaimer explaining that AI-generated information may contain inaccuracies and should be reviewed before professional use. Remind users not to submit confidential workplace information.

**Important:** Prioritise functionality, simplicity and a polished user experience. Build all three features with consistent styling. Avoid unnecessary features, complex integrations and backend dependencies.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7e770ffd-eb88-4fc8-953f-e17653456203).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
