import React from "react";
import "./Organizations.css";
import { Fade } from "react-awesome-reveal";
import OrganizationList from "../../components/organizationList/OrganizationList";
import OrganizationsData from "../../shared/opensource/organizations.json";

// Tóm tắt: Section logo tổ chức open-source đã từng đóng góp.
function Organizations({ theme }) {
  return (
    <div id="organizations">
      <div className="organizations-header-div">
        <Fade direction="up" duration={2000} triggerOnce>
          <h1 className="organizations-header" style={{ color: theme.text }}>
            Contributed Organizations
          </h1>
        </Fade>
      </div>
      <OrganizationList logos={OrganizationsData["data"]} />
    </div>
  );
}

export default Organizations;
