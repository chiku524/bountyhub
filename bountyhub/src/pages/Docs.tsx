import { Link } from 'react-router-dom'
import { 
  FiBook, 
  FiUser, 
  FiCode, 
  FiServer, 
  FiCloud, 
  FiShield,
  FiExternalLink,
  FiMessageSquare,
  FiMail
} from 'react-icons/fi'

interface DocItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  category: string;
  featured: boolean;
}

interface Category {
  name: string;
  title: string;
  description: string;
}

const docs = [
  {
    title: "Platform Documentation",
    description: "Complete overview of bountyhub platform features, architecture, and functionality",
    href: "/docs/platform",
    category: "overview",
    featured: true
  },
  {
    title: "User Guide",
    description: "Step-by-step guide for using all platform features and getting the most out of bountyhub",
    href: "/docs/user-guide",
    category: "user",
    featured: true
  },
  {
    title: "Developer Guide",
    description: "Technical documentation for developers, contributors, and integrators",
    href: "/docs/developer-guide",
    category: "developer",
    featured: true
  },
  {
    title: "API Reference",
    description: "Complete API documentation with endpoints, examples, and integration guides",
    href: "/docs/api-reference",
    category: "developer",
    featured: false
  },
  {
    title: "Deployment Guide",
    description: "Production deployment instructions and infrastructure setup",
    href: "/docs/deployment-guide",
    category: "developer",
    featured: false
  },
  {
    title: "Legal Documents",
    description: "Privacy policy and terms of service with PDF download options",
    href: "/docs/legal",
    category: "legal",
    featured: false
  },
  {
    title: "Refund System Guide",
    description: "Complete guide to the community governance refund system and time-based restrictions",
    href: "/docs/refund-system",
    category: "user",
    featured: false
  }
]

const categories = [
  {
    name: "overview",
    title: "Platform Overview",
    description: "General platform information and architecture"
  },
  {
    name: "user",
    title: "User Documentation",
    description: "Guides and tutorials for platform users"
  },
  {
    name: "developer",
    title: "Developer Resources",
    description: "Technical documentation and API references"
  },
  {
    name: "legal",
    title: "Legal & Compliance",
    description: "Legal documents and compliance information"
  }
]

export default function Docs() {
  // Add icons to the docs data
  const docsWithIcons = [
    { ...docs[0], icon: FiBook },
    { ...docs[1], icon: FiUser },
    { ...docs[2], icon: FiCode },
    { ...docs[3], icon: FiServer },
    { ...docs[4], icon: FiCloud },
    { ...docs[5], icon: FiShield },
    { ...docs[6], icon: FiShield }
  ]

  const getCategoryDocs = (categoryName: string): DocItem[] => {
    return docsWithIcons.filter((doc: DocItem) => doc.category === categoryName)
  }

  const getFeaturedDocs = (): DocItem[] => {
    return docsWithIcons.filter((doc: DocItem) => doc.featured)
  }

  return (
    <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
        <div className="mb-8 mt-16">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Documentation
          </h1>
          <p className="text-neutral-600 dark:text-gray-300 mb-4">
            Welcome to bountyhub's documentation. Here you'll find comprehensive guides and information about our platform.
          </p>
        </div>

        {/* Featured Documentation */}
        <div className="mb-20">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFeaturedDocs().map((doc: DocItem) => (
              <Link
                key={doc.href}
                to={doc.href}
                className="group block p-6 bg-white dark:bg-neutral-800/80 rounded-lg border-2 border-neutral-200 dark:border-violet-500/30 hover:border-violet-500/60 dark:hover:border-violet-500/60 transition-all duration-300 shadow-lg hover:shadow-violet-500/20 dark:hover:shadow-violet-500/20"
              >
                <div className="flex items-center mb-4">
                  <doc.icon className="w-8 h-8 text-violet-600 dark:text-violet-400 mr-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                    {doc.title}
                  </h3>
                </div>
                <p className="text-neutral-600 dark:text-gray-400 group-hover:text-neutral-700 dark:group-hover:text-gray-300 transition-colors">
                  {doc.description}
                </p>
                <div className="mt-4 flex items-center text-violet-600 dark:text-violet-400 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
                  <span className="text-sm font-medium">Read more</span>
                  <FiExternalLink className="w-4 h-4 ml-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Documentation by Category */}
        <div className="space-y-20">
          {categories.map((category: Category) => (
            <div key={category.name}>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-3">
                  {category.title}
                </h2>
                <p className="text-neutral-500 dark:text-gray-400">
                  {category.description}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCategoryDocs(category.name).map((doc: DocItem) => (
                  <Link
                    key={doc.href}
                    to={doc.href}
                    className="group block p-6 bg-white dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-violet-500/40 dark:hover:border-violet-500/40 transition-all duration-300"
                  >
                    <div className="flex items-center mb-4">
                      <doc.icon className="w-6 h-6 text-violet-600 dark:text-violet-400 mr-3" />
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                        {doc.title}
                      </h3>
                    </div>
                    <p className="text-neutral-600 dark:text-gray-400 group-hover:text-neutral-700 dark:group-hover:text-gray-300 transition-colors text-sm">
                      {doc.description}
                    </p>
                    <div className="mt-4 flex items-center text-violet-600 dark:text-violet-400 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
                      <span className="text-sm font-medium">Read more</span>
                      <FiExternalLink className="w-4 h-4 ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-20 p-8 bg-white dark:bg-neutral-800/80 rounded-lg border-2 border-neutral-200 dark:border-violet-500/30">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">Need Help?</h2>
            <p className="text-neutral-600 dark:text-gray-400 mb-6">
              Can't find what you're looking for? Our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/community"
                className="inline-flex items-center px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
              >
                <FiMessageSquare className="w-5 h-5 mr-2" />
                Ask the Community
              </Link>
              <a
                href="mailto:support@bountyhub.tech"
                className="inline-flex items-center px-6 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                <FiMail className="w-5 h-5 mr-2" />
                Contact Support
              </a>
            </div>
          </div>
        </div>
    </div>
  )
} 