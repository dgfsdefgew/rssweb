# Contributing to RSS Feed Generator

Thank you for your interest in contributing to the RSS Feed Generator! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Git for version control
- A code editor (VS Code recommended)

### Development Setup

1. **Fork and clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/rss-feed-generator.git
   cd rss-feed-generator
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   Add your API keys and configuration

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Verify the setup**
   Open [http://localhost:3000](http://localhost:3000) and test basic functionality

## 📋 Development Guidelines

### Code Style

We use TypeScript, ESLint, and Prettier to maintain code quality:

\`\`\`bash
# Check types
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
\`\`\`

### TypeScript Standards
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` types - use proper typing
- Use generic types where appropriate

\`\`\`typescript
// Good
interface NewsItem {
  id: string
  title: string
  link: string
  category: string
  timestamp: string
}

// Avoid
const item: any = { ... }
\`\`\`

### React Best Practices
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow the component composition pattern

\`\`\`typescript
// Good component structure
interface ComponentProps {
  title: string
  onAction: () => void
}

export default function Component({ title, onAction }: ComponentProps) {
  const [state, setState] = useState<string>("")
  
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  )
}
\`\`\`

### API Route Standards
- Use proper HTTP status codes
- Implement comprehensive error handling
- Add request validation
- Include TypeScript types for requests/responses

\`\`\`typescript
// API route example
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      )
    }
    
    // Process request...
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
\`\`\`

### Styling Guidelines
- Use Tailwind CSS for styling
- Follow the dark universe theme
- Maintain responsive design principles
- Use shadcn/ui components when possible

\`\`\`typescript
// Good styling approach
<div className="bg-black/60 border-purple-500/30 backdrop-blur-sm rounded-lg p-6">
  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
    Title
  </h2>
</div>
\`\`\`

## 🧪 Testing

### Running Tests
\`\`\`bash
# Run all tests
npm run test

# Test specific functionality
npm run test:debug
\`\`\`

### Writing Tests
- Test all new API endpoints
- Include edge cases and error scenarios
- Test UI components with user interactions
- Verify AI integration functionality

### Manual Testing Checklist
- [ ] Test with different website types
- [ ] Verify responsive design on mobile/tablet
- [ ] Check error handling with invalid URLs
- [ ] Test AI categorization accuracy
- [ ] Verify magazine layout generation

## 🎯 Contributing Areas

### High Priority
- **AI Model Improvements**: Enhance content extraction accuracy
- **Performance Optimization**: Reduce processing time
- **Error Handling**: Better user feedback and recovery
- **Mobile Experience**: Improve responsive design

### Medium Priority
- **New Features**: Additional export formats, scheduling
- **UI/UX Enhancements**: Better visual feedback, animations
- **Documentation**: Code comments, API documentation
- **Testing**: Automated test coverage

### Low Priority
- **Refactoring**: Code organization improvements
- **Accessibility**: ARIA labels, keyboard navigation
- **Internationalization**: Multi-language support

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

\`\`\`bash
# Feature
git commit -m "feat: add magazine layout generation"

# Bug fix
git commit -m "fix: resolve content extraction timeout"

# Documentation
git commit -m "docs: update API documentation"

# Refactor
git commit -m "refactor: improve error handling structure"

# Test
git commit -m "test: add unit tests for news extraction"
\`\`\`

### Commit Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🔄 Pull Request Process

### Before Submitting
1. **Create a feature branch**
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

2. **Make your changes**
   - Follow coding standards
   - Add tests if applicable
   - Update documentation

3. **Test thoroughly**
   \`\`\`bash
   npm run test
   npm run type-check
   npm run lint
   \`\`\`

4. **Commit your changes**
   \`\`\`bash
   git add .
   git commit -m "feat: your descriptive commit message"
   \`\`\`

### Pull Request Template
\`\`\`markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests for changes
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or marked as such)
\`\`\`

### Review Process
1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Manual testing by reviewers
4. **Approval**: Maintainer approval before merge

## 🐛 Bug Reports

### Before Reporting
- Check existing issues for duplicates
- Test with the latest version
- Gather reproduction steps

### Bug Report Template
\`\`\`markdown
**Bug Description**
Clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Version: [e.g., 1.0.0]

**Additional Context**
Screenshots, logs, etc.
\`\`\`

## 💡 Feature Requests

### Feature Request Template
\`\`\`markdown
**Feature Description**
Clear description of the proposed feature.

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Mockups, examples, etc.
\`\`\`

## 🏗️ Architecture Guidelines

### File Organization
\`\`\`
app/
├── api/                 # API routes
│   ├── autodetect/     # Content detection
│   ├── generate-feed/  # Feed generation
│   └── grok-news-scan/ # AI analysis
├── news/               # News extraction UI
├── test/               # Testing interfaces
└── debug/              # Debug tools

components/
├── ui/                 # shadcn/ui components
└── custom/             # Custom components

scripts/
├── test-websites.js    # Testing utilities
└── debug-tools.js      # Debug utilities
\`\`\`

### Component Structure
- Keep components small and focused
- Use composition over inheritance
- Implement proper prop interfaces
- Add error boundaries for robustness

### API Design
- RESTful endpoints where possible
- Consistent response formats
- Proper error handling
- Input validation

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers learn
- Focus on the project goals

### Communication
- Use GitHub Issues for bug reports
- Use GitHub Discussions for questions
- Be clear and concise in communications
- Provide context and examples

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Tools
- [VS Code](https://code.visualstudio.com/) - Recommended editor
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs
- Special mentions for outstanding contributions

Thank you for contributing to RSS Feed Generator! 🚀
