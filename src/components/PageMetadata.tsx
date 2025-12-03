import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { getPageMetadata, formatPageTitle } from '../utils/metadata'

interface PageMetadataProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogType?: string
}

export function PageMetadata({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  ogType = 'website' 
}: PageMetadataProps) {
  const location = useLocation()
  const pageMetadata = getPageMetadata(location.pathname)
  
  // Use provided props or fall back to page metadata
  const finalTitle = formatPageTitle(title || pageMetadata.title)
  const finalDescription = description || pageMetadata.description
  const finalKeywords = keywords || pageMetadata.keywords
  const finalOgImage = ogImage || pageMetadata.ogImage || 'https://bountyhub.tech/logo.png'
  const finalOgType = ogType || pageMetadata.ogType || 'website'
  
  const canonicalUrl = `https://bountyhub.tech${location.pathname}`
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={finalOgType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:site_name" content="bountyhub" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={finalOgImage} />
      <meta property="twitter:site" content="@bountyhub_tech" />
    </Helmet>
  )
} 