# RSS Feed Generator

An AI-powered RSS feed generator that transforms any website into intelligent, categorized news feeds with beautiful magazine-style layouts.

## 🌟 Features

### 🤖 AI-Powered Content Extraction
- **Smart Content Detection**: Automatically identifies news articles, blog posts, and content from any website
- **Intelligent Categorization**: AI sorts content into categories like Technology, Business, Politics, Sports, Entertainment, Health, Science, and World news
- **Importance Ranking**: Articles are ranked by relevance and importance using advanced algorithms
- **Multi-Page Crawling**: Scan multiple pages and sections for comprehensive coverage

### 🎨 Beautiful Presentation
- **Magazine-Style Layouts**: Transform plain RSS feeds into visually stunning magazine presentations
- **Dark Universe Theme**: Cosmic-inspired design with rotating matrix planets and space aesthetics
- **Category Color Coding**: Each news category gets its own distinctive color scheme
- **Responsive Design**: Perfect viewing experience on desktop, tablet, and mobile devices

### 🔧 Advanced Functionality
- **Custom Selector Support**: Define your own CSS selectors for precise content extraction
- **Debug Console**: Deep analysis tools for troubleshooting and optimization
- **Preview Generation**: Visual previews of articles with automatic image detection
- **RSS Feed Export**: Generate standard RSS XML feeds for subscription
- **Manual Curation**: Select specific articles to create personalized news collections

### 🚀 Performance & Reliability
- **Fast Processing**: Optimized extraction algorithms for quick results
- **Error Handling**: Robust error handling with detailed feedback
- **CORS Support**: Works with websites that have CORS restrictions
- **Rate Limiting**: Built-in protection against overuse

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/rss-feed-generator.git
   cd rss-feed-generator
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Add your API keys to `.env.local`:
   \`\`\`env
   XAI_API_KEY=your_xai_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Basic News Extraction

1. **Navigate to the News Extractor** (`/news`)
2. **Enter a website URL** (e.g., `https://techcrunch.com`)
3. **Click "Extract News"** to start the AI-powered analysis
4. **Review the results** - articles will be automatically categorized and ranked
5. **Select articles** you want to include in your feed
6. **Generate Magazine Layout** for a beautiful presentation

### Advanced Testing

1. **Use the Test Suite** (`/test`) for detailed analysis
2. **Try the Debug Console** (`/debug`) for troubleshooting
3. **Manual Testing** (`/manual-test`) for custom selector testing

### API Usage

The RSS Feed Generator provides several REST API endpoints:

#### Extract News with AI
\`\`\`typescript
POST /api/grok-news-scan
Content-Type: application/json

{
  "url": "https://example.com"
}
\`\`\`

#### Auto-detect Content Selectors
\`\`\`typescript
POST /api/autodetect
Content-Type: application/json

{
  "url": "https://example.com"
}
\`\`\`

#### Generate Custom Feed
\`\`\`typescript
POST /api/generate-feed
Content-Type: application/json

{
  "url": "https://example.com",
  "selectors": {
    "title": "h1, h2, .title",
    "link": "a[href]",
    "description": ".excerpt, .summary",
    "category": ".category, .tag",
    "timestamp": ".date, time"
  }
}
\`\`\`

#### Generate Magazine Layout
\`\`\`typescript
POST /api/generate-magazine-page
Content-Type: application/json

{
  "newsItems": [...],
  "feedTitle": "My News Magazine",
  "url": "https://source-website.com",
  "layout": "cosmic-universe"
}
\`\`\`

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **AI Integration**: xAI (Grok), Groq API
- **Content Parsing**: Cheerio, Puppeteer (optional)
- **Icons**: Lucide React

### Project Structure
\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── news/              # News extraction page
│   ├── test/              # Testing interface
│   ├── debug/             # Debug console
│   └── manual-test/       # Manual testing tools
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── scripts/              # Utility scripts
├── public/               # Static assets
└── docs/                 # Documentation
\`\`\`

### Key Components

- **News Extractor** (`/app/news/page.tsx`): Main interface for content extraction
- **AI Integration** (`/app/api/grok-news-scan/route.ts`): Grok AI-powered analysis
- **Magazine Generator** (`/app/api/generate-magazine-page/route.ts`): Beautiful layout creation
- **Debug Tools** (`/app/debug/page.tsx`): Advanced debugging interface

## 🧪 Testing

### Automated Testing
\`\`\`bash
# Run the test suite
npm run test

# Test specific websites
node scripts/test-websites.js
\`\`\`

### Manual Testing
1. Use the built-in test interfaces at `/test`, `/debug`, and `/manual-test`
2. Try different website types (news sites, blogs, e-commerce)
3. Test with various content structures and layouts

### Supported Websites
- News sites (BBC, CNN, TechCrunch, etc.)
- Blogs and personal websites
- E-commerce product pages
- Documentation sites
- Social media platforms (limited)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker
\`\`\`bash
# Build the Docker image
docker build -t rss-generator .

# Run the container
docker run -p 3000:3000 rss-generator
\`\`\`

### Manual Deployment
\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`

## 🔧 Configuration

### Environment Variables
- `XAI_API_KEY`: xAI API key for Grok integration
- `GROQ_API_KEY`: Groq API key for additional AI features
- `NEXT_PUBLIC_BASE_URL`: Base URL for the application

### Customization
- **Themes**: Modify the cosmic theme in component files
- **AI Models**: Switch between different AI providers in API routes
- **Selectors**: Add custom content selectors for specific websites
- **Categories**: Extend the category system in the AI prompts

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Conventional commits for commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions

## 🗺️ Roadmap

### Version 1.1 (Coming Soon)
- [ ] User authentication and saved feeds
- [ ] Scheduled feed updates
- [ ] More export formats (JSON, CSV)
- [ ] Enhanced AI confidence scoring
- [ ] Bulk website processing

### Version 1.2 (Future)
- [ ] Real-time feed monitoring
- [ ] Advanced filtering options
- [ ] Integration with popular RSS readers
- [ ] Custom AI model training
- [ ] Multi-language support

## 🙏 Acknowledgments

- **xAI** for providing the Grok AI model
- **Groq** for fast AI inference
- **Vercel** for hosting and deployment
- **shadcn/ui** for beautiful UI components
- **The open-source community** for inspiration and tools

---

**Built with ❤️ and AI** • Transform any website into intelligent news feeds
