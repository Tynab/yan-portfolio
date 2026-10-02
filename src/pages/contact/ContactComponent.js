import React from "react";
import SocialMedia from "../../components/socialMedia/SocialMedia";
import Button from "../../components/button/Button";
import BlogsImg from "./BlogsImg";
import AddressImg from "./AddressImg";
import { Fade } from "react-awesome-reveal";
import "./ContactComponent.css";
import { greeting, contactPageData } from "../../portfolio.js";
import PageTitle from "../../components/seoHeader/PageTitle";

const ContactData = contactPageData.contactSection;
const blogSection = contactPageData.blogSection;
const addressSection = contactPageData.addressSection;
const phoneSection = contactPageData.phoneSection;

// Tóm tắt: Trang Contact hiển thị kênh liên hệ, link hồ sơ và vị trí hiện tại.
function Contact({ theme }) {
  return (
    <div className="contact-main">
      <PageTitle title="Contact" />
      <div className="basic-contact">
        <Fade direction="up" duration={1000} triggerOnce>
          <div className="contact-heading-div">
            <div className="contact-heading-img-div">
              <img
                className="contact-profile-img"
                src={ContactData["profile_image_url"]}
                alt={greeting.title}
                width="460"
                height="460"
                // Ảnh nằm trong màn hình đầu tiên (LCP) nên tải ngay với độ ưu tiên cao.
                loading="eager"
                // React 18.3 chưa nhận prop fetchPriority (cảnh báo "does not recognize" khi dev) nên dùng
                // attribute HTML viết thường; khi lên React 19 thì đổi thành fetchPriority và bỏ dòng disable.
                // eslint-disable-next-line react/no-unknown-property
                fetchpriority="high"
              />
            </div>
            <div className="contact-heading-text-div">
              <h1
                className="contact-heading-text"
                style={{ color: theme.text }}
              >
                {ContactData["title"]}
              </h1>
              <p
                className="contact-header-detail-text subTitle"
                style={{ color: theme.secondaryText }}
              >
                {ContactData["description"]}
              </p>
              <SocialMedia />
              <div className="resume-btn-div">
                <Button
                  text="View My Resume"
                  newTab={true}
                  href={greeting.resumeLink}
                />
              </div>
            </div>
          </div>
        </Fade>
        <Fade direction="up" duration={1000} triggerOnce>
          <div className="blog-heading-div">
            <div className="blog-heading-text-div">
              <h2 className="blog-heading-text" style={{ color: theme.text }}>
                {blogSection["title"]}
              </h2>
              <p
                className="blog-header-detail-text subTitle"
                style={{ color: theme.secondaryText }}
              >
                {blogSection["subtitle"]}
              </p>
              <div className="blogsite-btn-div">
                <Button
                  text="Visit My GitHub"
                  newTab={true}
                  href={blogSection.link}
                />
              </div>
            </div>
            <div className="blog-heading-img-div">
              <BlogsImg theme={theme} />
            </div>
          </div>
        </Fade>
        <Fade direction="up" duration={1000} triggerOnce>
          <div className="address-heading-div">
            <div className="contact-heading-img-div">
              <AddressImg theme={theme} />
            </div>
            <div className="address-heading-text-div">
              <h2
                className="address-heading-text"
                style={{ color: theme.text }}
              >
                {addressSection["title"]}
              </h2>
              <p
                className="contact-header-detail-text subTitle"
                style={{ color: theme.secondaryText }}
              >
                {addressSection["subtitle"]}
              </p>
              {phoneSection["title"] && (
                <>
                  <h2
                    className="address-heading-text"
                    style={{ color: theme.text }}
                  >
                    {phoneSection["title"]}
                  </h2>
                  <p
                    className="contact-header-detail-text subTitle"
                    style={{ color: theme.secondaryText }}
                  >
                    {phoneSection["subtitle"]}
                  </p>
                </>
              )}
              <div className="address-btn-div">
                <Button
                  text="View on Google Maps"
                  newTab={true}
                  href={addressSection.location_map_link}
                />
              </div>
            </div>
          </div>
        </Fade>
      </div>
    </div>
  );
}

export default Contact;
