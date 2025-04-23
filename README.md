# Code Practice Platform

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![AWS Amplify](https://img.shields.io/badge/AWS%20Amplify-6.6.6-orange.svg)](https://aws.amazon.com/amplify/)
[![Material UI](https://img.shields.io/badge/MUI-7.0.2-purple.svg)](https://mui.com/)

A coding practice platform that allows students to solve programming challenges with an AI-powered teacher assistant. Built with React, Material UI, and AWS Amplify.

## 🌟 Features

- **Interactive Code Blocks**: Students can select from various coding challenges to practice their skills
- **AI-Powered Teaching Assistant**: Get hints and ask questions to an AI tutor powered by OpenAI
- **Real-time Mentor Mode**: Mentors can observe and guide multiple students simultaneously
- **Real-time Code Validation**: Instant feedback on solutions
- **Responsive Design**: Works on desktop and mobile devices
- **Beautiful UI**: Modern, clean interface built with Material UI v7

## 🛠️ Technologies

- **Frontend**: React, TypeScript, Vite
- **UI Framework**: Material UI v7
- **State Management**: React hooks and context
- **Backend Services**: AWS Amplify
- **Database**: Amazon DynamoDB
- **Authentication**: Amazon Cognito
- **API**: AWS AppSync (GraphQL)
- **Code Editor**: CodeMirror
- **AI**: OpenAI GPT API

## 📋 Architecture

The application follows a modern React architecture:

- **Routes**: Main pages for lobby and individual code blocks
- **Components**: Reusable UI elements
- **Utilities**: Service functions for API calls and business logic
- **Theme**: Consistent styling with MUI theming

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- AWS account (for deploying)
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/code-practice-platform.git
   cd code-practice-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Initialize Amplify (if not already initialized):
   ```bash
   npm install -g @aws-amplify/cli
   amplify init
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🧪 Usage

1. **Browse Code Blocks**: View available coding challenges on the home page
2. **Select a Challenge**: Click on a code block to start solving it
3. **Write Code**: Use the embedded code editor to write your solution
4. **Get Help**: Use the AI teacher feature to ask questions or get hints
5. **Submit Solution**: Your solution is automatically validated when it matches the expected output

## 🧩 Key Components

- **Lobby**: Landing page showing all available code blocks
- **Block**: Individual coding challenge page with editor and tools
- **StudentView**: Interface for students to solve challenges
- **MentorView**: Interface for mentors to observe students
- **ChatTeacher**: AI-powered assistant to help students

## 🔧 Configuration

The application can be configured via:

1. **AWS Amplify**: Backend resources configuration
2. **Theme**: Visual customization through MUI theming
3. **OpenAI**: Prompts and model settings in `openAiService.ts`

## 📤 Deployment

Deploy to AWS Amplify:

```bash
amplify publish
```

For detailed deployment instructions, refer to the [AWS Amplify documentation](https://docs.amplify.aws/guides/hosting/git-based-deployments/q/platform/js/).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [AWS Amplify](https://aws.amazon.com/amplify/) for the backend infrastructure
- [Material UI](https://mui.com/) for the UI components
- [OpenAI](https://openai.com/) for the AI assistant capabilities
- [CodeMirror](https://codemirror.net/) for the code editor