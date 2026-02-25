import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
}) => {
  const siteTitle = "PK.Chat | Modern Messaging";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const siteDescription =
    description ||
    "Experience the next generation of messaging with PK.Chat. Secure, fast, and feature-rich real-time communication.";
  const siteKeywords =
    keywords ||
    "PK.Chat, messaging app, real-time chat, secure messaging, react chat app, PK Chat";
  const siteUrl = url || window.location.href;
  const siteImage = image || "/WhatsApp.svg.png"; // Make sure this path is correct

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />

      {/* Canonical Link */}
      <link rel="canonical" href={siteUrl} />
    </Helmet>
  );
};

export default SEO;
