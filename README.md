# NewX Project - Ebook Reader

An ebook reader application built with Electron and Next.js, based on the readest project architecture.

## Features

- 📚 **Multi-format Support**: EPUB, PDF, TXT, MOBI, AZW3, FB2, CBZ
- 🎨 **Custom Themes**: Light, Dark, Sepia, and custom colors
- 📖 **Flexible Layout**: Single page, double page, continuous scroll
- 🧭 **Smart Navigation**: Table of contents, bookmarks, full-text search
- 📊 **Progress Tracking**: Auto-save reading position and progress
- 🖥️ **Cross-platform**: Windows, macOS, Linux
- 🔄 **TXT to EPUB**: Automatic conversion for TXT files
- 📱 **Responsive Design**: Works on different screen sizes

## Technology Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Desktop**: Electron
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: Zustand
- **Book Rendering**: foliate-js (as git submodule)
- **Icons**: React Icons

## Project Structure

```
new-x-project/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── library/           # Library page
│   │   ├── reader/            # Reader page
│   │   └── page.tsx           # Home page (redirects to library)
│   ├── components/            # Reusable components
│   │   ├── ui/               # Basic UI components
│   │   ├── library/          # Library-specific components
│   │   └── reader/           # Reader-specific components
│   ├── store/                # Zustand stores
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   └── styles/               # Global styles
├── packages/
│   └── foliate-js/           # Book rendering engine (git submodule)
├── main.js                   # Electron main process
└── package.json
```

## Getting Started

### Prerequisites

- Node.js v22 or higher
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd new-x-project
   ```

2. **Switch to Node.js v22**
   ```bash
   nvm use v22
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Initialize git submodules**
   ```bash
   git submodule update --init --recursive
   ```

### Development

1. **Start Next.js development server**
   ```bash
   npm run dev:next
   ```

2. **Start Electron (in another terminal)**
   ```bash
   npm run dev:electron
   ```

3. **Or start both together**
   ```bash
   npm run dev
   ```

### Building

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Build Electron app**
   ```bash
   npm run build:electron
   ```

## Current Implementation Status

### ✅ Completed Features

1. **Project Setup**
   - ✅ Electron + Next.js integration
   - ✅ TypeScript configuration
   - ✅ Tailwind CSS + DaisyUI setup
   - ✅ foliate-js as git submodule
   - ✅ Project structure and configuration

2. **Static Pages (100% based on readest design)**
   - ✅ Library page with grid/list view
   - ✅ Reader page with sidebar navigation
   - ✅ Settings modal with font/theme/layout options
   - ✅ Responsive design and hover interactions

3. **State Management**
   - ✅ Settings store (Zustand)
   - ✅ Library store for book management
   - ✅ Reader store for reading state

4. **UI Components**
   - ✅ Button component
   - ✅ Spinner component
   - ✅ Basic styling and themes

### 🚧 Next Steps (Planned)

1. **Book Upload & Storage**
   - File upload functionality
   - Local storage management
   - Book metadata extraction

2. **Dynamic Book List**
   - Real book data integration
   - Search and filtering
   - Sort options

3. **Reader Core**
   - foliate-js integration
   - Chapter navigation
   - Progress tracking

4. **Format Support**
   - TXT to EPUB conversion
   - Multi-format rendering
   - Cover image extraction

5. **Advanced Features**
   - Bookmarks and annotations
   - Theme customization
   - Search functionality

## Development Notes

- The project is currently in the static pages phase
- All UI designs are 100% based on the readest project
- Mock data is used for demonstration purposes
- Real functionality will be implemented in subsequent phases

## Testing

Visit `http://localhost:3000` in your browser to see the current implementation:

- **Library Page**: Browse books in grid/list view
- **Reader Page**: Click on any book to open the reader
- **Settings**: Use the settings button in the reader

## Contributing

This project follows the exact design and functionality patterns from the readest project. When implementing new features, always reference the readest codebase for consistency.

## License

ISC 