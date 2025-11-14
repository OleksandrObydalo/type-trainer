# Typing Trainer - Speed Training

An adaptive typing trainer application that helps you improve your typing speed through intelligent practice. The app tracks your performance on individual letters and adapts lessons to focus on areas that need improvement.

## Features

- **Real-time Metrics**: Track your WPM (Words Per Minute), accuracy, and score
- **Adaptive Learning**: The app automatically focuses on letters you type slowly
- **Letter Confidence Tracking**: Visual indicators show which letters you've mastered
- **Progressive Difficulty**: Unlock new letters as you improve
- **Beautiful UI**: Modern, responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory. You can preview the production build with:

```bash
npm run preview
```

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Automatic Deployment

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the site when you push to the `master` or `main` branch.

**To enable GitHub Pages:**

1. Go to your repository settings on GitHub
2. Navigate to **Pages** in the left sidebar
3. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
4. The workflow will automatically deploy on the next push to `master` or `main`

**Live Site:** https://oleksandrobydalo.github.io/type-trainer/

### Manual Deployment

If you prefer to deploy manually:

1. Build the project: `npm run build`
2. The `dist` folder contains the production-ready files
3. Configure GitHub Pages to serve from the `dist` folder or use the GitHub Actions workflow

## How to Use

1. **Start Typing**: Click on the input field or start typing to begin a lesson
2. **Type the Text**: Type the displayed text as accurately as possible
3. **Track Progress**: Watch your WPM, accuracy, and score update in real-time
4. **Focus Letters**: Letters you type slowly will appear more frequently in future lessons
5. **Unlock Letters**: As you master the current set of letters, new ones will be unlocked automatically

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization

## Project Structure

```
type-trainer/
├── src/
│   ├── components/
│   │   └── TypingTrainer.tsx  # Main typing trainer component
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── index.html                 # HTML template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
└── tailwind.config.js         # Tailwind config
```

## License

MIT

