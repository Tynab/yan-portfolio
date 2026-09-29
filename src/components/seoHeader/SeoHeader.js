import React from "react";
import { Helmet } from "react-helmet-async";
import {
  greeting,
  seo,
  socialMediaLinks,
  experience,
  contactPageData,
  certifications,
} from "../../portfolio.js";

// Chuỗi rỗng trong portfolio.js -> undefined để JSON.stringify bỏ hẳn key (schema.org coi "" là giá trị không hợp lệ).
const orUndefined = (value) => value || undefined;

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
  // Object JSON-LD schema.org Person, nhúng vào <script type="application/ld+json"> bên dưới để hỗ trợ SEO.
  const data = {
    "@context": "https://schema.org/",
    "@type": "Person",
    name: greeting.title,
    url: seo?.og?.url,
    email: mail,
    telephone: orUndefined(contactPageData.phoneSection?.subtitle),
    sameAs: sameAs,
    jobTitle: job?.title,
    worksFor: {
      "@type": "Organization",
      name: job?.company,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: orUndefined(contactPageData.addressSection?.locality),
      addressRegion: orUndefined(contactPageData.addressSection?.region),
      addressCountry: orUndefined(contactPageData.addressSection?.country),
      postalCode: orUndefined(contactPageData.addressSection?.postalCode),
      streetAddress: orUndefined(contactPageData.addressSection?.streetAddress),
    },
    hasCredential: credentials,
  };
  return (
    <Helmet>
      {/* description/og:* nằm tĩnh trong index.html; ở đây chỉ set title và JSON-LD để tránh thẻ trùng. */}
      <title>{seo.title}</title>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export default SeoHeader;
