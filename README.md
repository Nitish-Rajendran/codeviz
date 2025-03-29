# CodeViz

CodeViz is a web application for visualizing and understanding code structures. It provides an interactive interface for exploring and analyzing code, making it easier to comprehend complex codebases.

## Features

- Interactive code visualization
- Support for multiple programming languages (Python, JavaScript, Java, C++)
- Modern UI with responsive design
- Code editing capabilities with CodeMirror integration

## Tech Stack

- **Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: TailwindCSS
- **Package Manager**: pnpm
- **Code Editor**: CodeMirror
- **UI Components**: Radix UI

## Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (v10 or higher)

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/codeviz.git
   cd codeviz
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

To start the development server:

```bash
pnpm dev
```

This will start the application at [http://localhost:3000](http://localhost:3000).

### Building for Production

To create a production build:

```bash
pnpm build
```

To start the production server:

```bash
pnpm start
```

## Project Structure

- `/app` - Next.js application routes and pages
- `/components` - Reusable UI components
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and shared logic
- `/public` - Static assets
- `/styles` - Global styles and CSS utilities

## Demo Video

[Watch Demo Video](https://github.com/Nitish-Rajendran/codeviz/blob/master/Demo.mp4)

## License

[MIT](LICENSE)
