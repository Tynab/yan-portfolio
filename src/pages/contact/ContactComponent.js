import React from "react";
import PageLayout from "../../components/pageLayout/PageLayout";
import SocialMedia from "../../components/socialMedia/SocialMedia";
import Button from "../../components/button/Button";
import BlogsImg from "./BlogsImg";
import AddressImg from "./AddressImg";
import { Fade } from "react-awesome-reveal";
import "./ContactComponent.css";
import { greeting, contactPageData } from "../../portfolio.js";

const ContactData = contactPageData.contactSection;
const blogSection = contactPageData.blogSection;
const addressSection = contactPageData.addressSection;
const phoneSection = contactPageData.phoneSection;

// Tóm tắt: Trang Contact hiển thị kênh liên hệ, link hồ sơ và vị trí hiện tại.
function Contact({ theme }) {
  return (
    <PageLayout theme={theme} className="contact-main">
      <div className="basic-contact">
        <Fade direction="up" duration={1000}>
          <div className="contact-heading-div">
            <div className="contact-heading-img-div">
              <img
                src={
                  new URL(
                    `../../assests/images/${ContactData["profile_image_path"]}`,
                    import.meta.url
                  ).href
                }
                alt={ContactData["title"]}
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
              <SocialMedia theme={theme} />
              <div className="resume-btn-div">
                <Button
                  text="See My Resume"
                  newTab={true}
                  href={greeting.resumeLink}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        </Fade>
        <Fade direction="up" duration={1000}>
          <div className="blog-heading-div">
            <div className="blog-heading-text-div">
              <h1 className="blog-heading-text" style={{ color: theme.text }}>
                {blogSection["title"]}
              </h1>
              <p
                className="blog-header-detail-text subTitle"
                style={{ color: theme.secondaryText }}
              >
                {blogSection["subtitle"]}
              </p>
              <div className="blogsite-btn-div">
                <Button
                  text="Visit My Blogsite"
                  newTab={true}
                  href={blogSection.link}
                  theme={theme}
                />
              </div>
            </div>
            <div className="blog-heading-img-div">
              <BlogsImg theme={theme} />
            </div>
          </div>
        </Fade>
        <Fade direction="up" duration={1000}>
          <div className="address-heading-div">
            <div className="contact-heading-img-div">
              <AddressImg theme={theme} />
            </div>
            <div className="address-heading-text-div">
              <h1
                className="address-heading-text"
                style={{ color: theme.text }}
              >
                {addressSection["title"]}
              </h1>
              <p
                className="contact-header-detail-text subTitle"
                style={{ color: theme.secondaryText }}
              >
                {addressSection["subtitle"]}
              </p>
              <h1
                className="address-heading-text"
                style={{ color: theme.text }}
              >
                {phoneSection["title"]}
              </h1>
              <p
                className="contact-header-detail-text subTitle"
                style={{ color: theme.secondaryText }}
              >
                {phoneSection["subtitle"]}
              </p>
              <div className="address-btn-div">
                <Button
                  text="Visit on Google Maps"
                  newTab={true}
                  href={addressSection.location_map_link}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        </Fade>
      </div>
    </PageLayout>
  );
}

export default Contact;
