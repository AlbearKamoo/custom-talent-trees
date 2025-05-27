# Custom Talent Trees

A React-based talent tree editor inspired by World of Warcraft's talent system. This application allows users to create, edit, and manage talent builds with an intuitive visual interface.

## Features

- **Interactive Talent Nodes**: Click to allocate/deallocate talent points
- **Visual Connections**: See talent prerequisites and progression paths
- **State Management**: Proper validation of talent requirements and dependencies
- **Export/Import**: Save and load talent builds as JSON files
- **Responsive Design**: Modern UI with Tailwind CSS
- **TypeScript**: Full type safety and IntelliSense support

## Project Structure

```
src/
├── components/
│   ├── TalentTreeEditor.tsx    # Main editor component
│   ├── TalentNode.tsx          # Individual talent node component
│   └── TalentConnection.tsx    # Visual connection lines
├── hooks/
│   └── useTalentTree.ts        # Custom hook for talent tree state management
├── types/
│   └── talent.ts               # TypeScript type definitions
├── utils/
│   └── tree-utils.ts           # Utility functions for tree operations
├── data/
│   └── sampleTalentTree.ts     # Sample talent tree data
└── App.tsx                     # Main application component
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd custom-talent-trees
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

### Basic Interaction

- **Left Click**: Allocate a talent point to a node
- **Right Click**: Remove a talent point from a node
- **Hover**: View detailed talent information in tooltip

### Controls

- **Reset**: Clear all allocated points and start over
- **Export**: Download your current build as a JSON file
- **Import**: Load a previously saved build from a JSON file

### Talent System Rules

1. **Point Requirements**: Each tier requires a certain number of points spent in previous tiers
2. **Prerequisites**: Some talents require specific other talents to be learned first
3. **Maximum Ranks**: Each talent has a maximum number of points that can be allocated
4. **Dependencies**: Removing points from a talent may not be allowed if other talents depend on it

## Customization

### Creating Your Own Talent Tree

You can create custom talent trees by modifying the data structure in `src/data/sampleTalentTree.ts` or creating new tree files. The talent tree structure includes:

```typescript
interface TalentTree {
  id: string;
  name: string;
  description: string;
  totalPoints: number;
  spentPoints: number;
  nodes: TalentNode[];
  connections: TalentConnection[];
}
```

### Styling

The application uses Tailwind CSS with custom color schemes defined in `tailwind.config.js`. You can modify the talent-specific colors:

- `talent-locked`: Unavailable talents
- `talent-available`: Talents that can be learned
- `talent-selected`: Talents with points allocated
- `talent-connection`: Visual connection lines

## State Management

The application uses React hooks for state management:

- **useTalentTree**: Main hook for managing talent tree state
- **useState**: For component-level state
- **useCallback**: For optimized event handlers
- **useMemo**: For computed values like node states

## API Reference

### Key Functions

- `calculateTalentState()`: Determines if a talent is locked, available, or selected
- `allocatePoint()`: Adds a point to a talent (with validation)
- `deallocatePoint()`: Removes a point from a talent (with dependency checking)
- `exportTreeState()`: Serializes current build to JSON
- `importTreeState()`: Loads build from JSON data

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Build and Development

### Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

### Performance Benefits with Vite

This project now uses Vite instead of Create React App, providing:
- ⚡ **Lightning fast HMR** (Hot Module Replacement)
- 🚀 **Instant server start** - no bundling in development
- 📦 **Optimized builds** with Rollup
- 🔧 **Better TypeScript support** out of the box

## Acknowledgments

- Inspired by World of Warcraft's talent system
- Built with React, TypeScript, Vite, and Tailwind CSS
- Reference UI: [Wowhead Talent Calculator](https://www.wowhead.com/talent-calc/death-knight/blood)
