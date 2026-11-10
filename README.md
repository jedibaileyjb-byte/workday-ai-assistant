
# AI Workplace Productivity Assistant

A modern, responsive workplace productivity application designed to help professionals draft emails, research topics, and manage everyday workplace tasks using AI.

## Project Overview

The **AI Workplace Productivity Assistant** combines three AI-powered tools into one dashboard:

- Smart Email Generator for drafting professional emails.
- AI Research Assistant for summarising information and identifying insights.
- AI Workplace Chatbot for answering questions and assisting with workplace tasks.

The application features a modern SaaS-style dashboard with sidebar navigation, a dark navy and turquoise-blue colour scheme, and a responsive interface.

> **Responsible AI:** AI-generated content may contain inaccuracies or incomplete information. Always review outputs before using them professionally. Do not enter confidential or sensitive workplace information.

## Features Implemented

### 1. Smart Email Generator
- Generate professional emails based on user instructions.
- Select between three writing tones: Formal, Friendly and Persuasive.
- Edit generated email content.
- Copy, regenerate or clear generated emails.

### 2. AI Research Assistant
- Research topics and summarise articles.
- Accept pasted text and website URLs.
- Generate structured summaries and key findings.
- Provide insights and actionable recommendations.

### 3. AI Workplace Chatbot
- Interactive AI-powered chat interface.
- Answer workplace-related questions.
- Assist with writing, brainstorming, planning and problem-solving.
- Maintain conversation history during the active session.

### 4. Dashboard and User Interface
- Modern dashboard with sidebar navigation.
- Responsive design for desktop and mobile devices.
- Editable AI-generated outputs.
- Loading indicators and error handling.
- Simple and user-friendly navigation.

## Technologies and Tools Used

| Technology / Tool | Purpose |
|---|---|
| Lovable | AI-assisted application development |
| React | User interface development |
| TypeScript / JavaScript | Application functionality |
| Tailwind CSS | Styling and responsive design |
| Google Gemini API | AI-generated responses |
| GitHub | Version control and project hosting |

*Note: Confirm the exact frameworks and dependencies against the generated project's package.json.*

## Setup Instructions

### Prerequisites

- Node.js
- npm
- Git
- Google AI Studio API key (for Gemini AI functionality)

### 1. Clone the Repository

Replace the placeholders with your GitHub username and repository name.

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
```

Navigate into the project folder:

```bash
cd YOUR-REPOSITORY
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the AI Provider

The application uses Google Gemini API for AI-generated responses.

1. Visit [Google AI Studio](https://aistudio.google.com/api-keys).
2. Create a Gemini API key.
3. Open the application's Settings page.
4. Enter your API key in the AI provider settings.
5. Save your settings.
6. Test the AI features.

**Important:** API usage is subject to Google's free-tier limits and rate limits. Never upload API keys to GitHub or expose personal secret keys in a publicly accessible application.

### 4. Run the Application

Start the local development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal to access the application.

### 5. Build for Production

```bash
npm run build
```

## Project Structure

The project structure may vary depending on the Lovable-generated application.

```text
project-root/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── ...
├── package.json
└── README.md
```

## How to Use the Application

1. Open the AI Workplace Productivity Assistant.
2. Navigate using the sidebar.
3. Select Email Generator, Research Assistant or AI Chatbot.
4. Enter your instructions or research content.
5. Generate an AI response.
6. Review, edit and copy the generated output.

## Limitations

- AI functionality requires a valid AI provider connection.
- Free API usage is subject to provider quotas and rate limits.
- Some websites may restrict automated access, affecting URL summarisation.
- The application does not use a custom backend or database.
- Direct browser-based API integration is intended for private prototyping; publicly deployed applications require secure API key handling.

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push your branch.
5. Submit a pull request.

## License

No open-source licence has been specified yet. Add a LICENSE file if you intend to distribute the project under an open-source licence.
