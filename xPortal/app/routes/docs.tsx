import { json, type MetaFunction } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { Layout } from '~/components/Layout';
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
} from 'react-icons/fi';

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

interface LoaderData {
  docs: Array<{
    title: string;
    description: string;
    href: string;
    category: string;
    featured: boolean;
  }>;
  categories: Category[];
}

export const meta: MetaFunction = () => {
  return [
    { title: "Documentation - portal.ask" },
    { name: "description", content: "Learn how to use portal.ask and explore our documentation" },
  ];
};

export const loader = async (): Promise<Response> => {
  return json<LoaderData>({
    docs: [
      {
        title: "Platform Documentation",
        description: "Complete overview of portal.ask platform features, architecture, and functionality",
        href: "/docs/platform",
        category: "overview",
        featured: true
      },
      {
        title: "User Guide",
        description: "Step-by-step guide for using all platform features and getting the most out of portal.ask",
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
    ],
    categories: [
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
        title: "Legal &amp; Compliance",
        description: "Legal documents and compliance information"
      }
    ]
  });
};

export default function DocsPage() {
  const data = useLoaderData<typeof loader>();
  const { docs, categories } = data as LoaderData;

  // Add icons to the docs data
  const docsWithIcons = [
    { ...docs[0], icon: FiBook },
    { ...docs[1], icon: FiUser },
    { ...docs[2], icon: FiCode },
    { ...docs[3], icon: FiServer },
    { ...docs[4], icon: FiCloud },
    { ...docs[5], icon: FiShield },
    { ...docs[6], icon: FiShield }
  ];

  const getCategoryDocs = (categoryName: string): DocItem[] => {
    return docsWithIcons.filter((doc: DocItem) => doc.category === categoryName);
  };

  const getFeaturedDocs = (): DocItem[] => {
    return docsWithIcons.filter((doc: DocItem) => doc.featured);
  };

  return (
    <Layout>
      <div className="w-auto max-w-8xl mx-auto mt-4 px-4 ml-24 pb-16">
        <div className="mb-8 mt-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Documentation
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl">
            Welcome to the portal.ask documentation. Find everything you need to understand, 
            use, and develop with our platform.
          </p>
        </div>

        {/* Featured Documentation */}
        <div className="mb-20">
          <h2 className="text-2xl font-semibold text-white mb-6">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFeaturedDocs().map((doc: DocItem) => (
              <Link
                key={doc.href}
                to={doc.href}
                className="group block p-6 bg-neutral-800/80 rounded-lg border-2 border-violet-500/30 hover:border-violet-500/60 transition-all duration-300 shadow-lg hover:shadow-violet-500/20"
              >
                <div className="flex items-center mb-4">
                  <doc.icon className="w-8 h-8 text-violet-400 mr-4" />
                  <h3 className="text-xl font-semibold text-white group-hover:text-violet-300 transition-colors">
                    {doc.title}
                  </h3>
                </div>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {doc.description}
                </p>
                <div className="mt-4 flex items-center text-violet-400 group-hover:text-violet-300 transition-colors">
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
                <h2 className="text-2xl font-semibold text-white mb-3">
                  {category.title}
                </h2>
                <p className="text-gray-400">
                  {category.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCategoryDocs(category.name).map((doc: DocItem) => (
                  <Link
                    key={doc.href}
                    to={doc.href}
                    className="group block p-6 bg-neutral-800/60 rounded-lg border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300"
                  >
                    <div className="flex items-center mb-3">
                      <doc.icon className="w-6 h-6 text-violet-400 mr-4" />
                      <h3 className="text-lg font-medium text-white group-hover:text-violet-300 transition-colors">
                        {doc.title}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                      {doc.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-20 p-8 bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-lg border border-violet-500/30">
          <h2 className="text-2xl font-semibold text-white mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/community"
              className="flex items-center p-4 bg-neutral-800/60 rounded-lg hover:bg-neutral-700/60 transition-colors"
            >
              <FiUser className="w-5 h-5 text-violet-400 mr-3" />
              <span className="text-white">Community</span>
            </Link>
            
            <Link
              to="/posts/create"
              className="flex items-center p-4 bg-neutral-800/60 rounded-lg hover:bg-neutral-700/60 transition-colors"
            >
              <FiCode className="w-5 h-5 text-violet-400 mr-3" />
              <span className="text-white">Create Post</span>
            </Link>
            
            <Link
              to="/wallet"
              className="flex items-center p-4 bg-neutral-800/60 rounded-lg hover:bg-neutral-700/60 transition-colors"
            >
              <FiCloud className="w-5 h-5 text-violet-400 mr-3" />
              <span className="text-white">Wallet</span>
            </Link>
            
            <Link
              to="/settings"
              className="flex items-center p-4 bg-neutral-800/60 rounded-lg hover:bg-neutral-700/60 transition-colors"
            >
              <FiShield className="w-5 h-5 text-violet-400 mr-3" />
              <span className="text-white">Settings</span>
            </Link>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-20 p-8 bg-neutral-800/60 rounded-lg border border-violet-500/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center p-4 bg-neutral-700/40 rounded-lg">
              <FiMessageSquare className="w-6 h-6 text-violet-400 mr-3" />
              <div>
                <h3 className="text-white font-medium">Discord Community</h3>
                <p className="text-gray-400 text-sm">Join our community for real-time help</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-neutral-700/40 rounded-lg">
              <FiMessageSquare className="w-6 h-6 text-violet-400 mr-3" />
              <div>
                <h3 className="text-white font-medium">GitHub Issues</h3>
                <p className="text-gray-400 text-sm">Report bugs and request features</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-neutral-700/40 rounded-lg">
              <FiMail className="w-6 h-6 text-violet-400 mr-3" />
              <div>
                <h3 className="text-white font-medium">Email Support</h3>
                <p className="text-gray-400 text-sm">Get direct support via email</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 mb-4">
              Can't find what you're looking for? Our team is here to help!
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://discord.gg/zvB9gwhq"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
              >
                <FiMessageSquare className="w-4 h-4 mr-2" />
                Join Discord
              </a>
              <a
                href="mailto:bountybucks524@gmail.com"
                className="inline-flex items-center px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
              >
                <FiMail className="w-4 h-4 mr-2" />
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 