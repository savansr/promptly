# Promptly - AI Prompt Manager Chrome Extension

Promptly is a Chrome extension that helps you manage and organize your AI prompts efficiently. It provides a user-friendly interface to store, categorize, and quickly access your frequently used prompts.

## Features

- Store and organize AI prompts
- Categorize prompts for easy access
- Enhance Your prompts for LLM response
- Quick access through Chrome extension
- User authentication and secure storage
- Modern and intuitive user interface
- Responsive design with Tailwind CSS

## Tech Stack

### Frontend
- React.js
- Redux Toolkit for state management
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

### Backend (Hosted Service)
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Groq SDK for AI integration

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)
- Chrome browser

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/promptly.git
cd promptly
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```


## Development Setup


2. Build the extension:
```bash
cd frontend
npm run build
```

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `frontend/build` directory

## Usage

1. Click the Promptly extension icon in your Chrome toolbar
2. Sign up or log in to your account
3. Start creating and organizing your prompts
4. Access your prompts anytime through the extension popup

## Project Structure

```
project/
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/        # Redux store
│   │   ├── utils/        # Utility functions
│   │   └── App.js        # Main application component
│   └── public/           # Static files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Groq](https://groq.com/)
