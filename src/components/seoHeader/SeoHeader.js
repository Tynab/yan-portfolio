import React from "react";
import { Helmet } from "react-helmet";
import {
  greeting,
  seo,
  socialMediaLinks,
  experience,
  contactPageData,
  certifications,
} from "../../portfolio.js";

// Tóm tắt: Gắn meta SEO và JSON-LD Person dựa trên dữ liệu portfolio trung tâm.
function SeoHeader() {
  const sameAs = socialMediaLinks
    .filter(
      (media) =>
        !(media.link.startsWith("tel") || media.link.startsWith("mailto"))
    )
    .map((media) => media.link);

  const mail = socialMediaLinks
    .find((media) => media.link.startsWith("mailto"))
    ?.link.substring("mailto:".length);
  const job = experience.sections
    ?.find((section) => section.work)
    ?.experiences?.at(0);

  const credentials = certifications.certifications.map((certification) => {
    return {
      "@context": "https://schema.org",
      "@type": "EducationalOccupationalCredential",
      url: certification.certificate_link,
      name: certification.title,
      description: certification.subtitle,
    };
  });
  const data = {
    "@context": "https://schema.org/",
    "@type": "Person",
    name: greeting.title,
    url: seo?.og?.url,
    email: mail,
    telephone: contactPageData.phoneSection?.subtitle,
    sameAs: sameAs,
    jobTitle: job?.title,
    worksFor: {
      "@type": "Organization",
      name: job?.company,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: contactPageData.addressSection?.locality,
      addressRegion: contactPageData.addressSection?.region,
      addressCountry: contactPageData.addressSection?.country,
      postalCode: contactPageData.addressSection?.postalCode,
      streetAddress: contactPageData.addressSection?.streetAddress,
    },
    hasCredential: credentials,
  };
  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta property="og:title" content={seo?.og?.title} />
      <meta property="og:type" content={seo?.og?.type} />
      <meta property="og:url" content={seo?.og?.url} />
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export default SeoHeader;
