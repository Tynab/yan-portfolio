import React, { Component } from "react";
import "./OrganizationList.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Fade } from "react-awesome-reveal";

// Tóm tắt: Danh sách logo tổ chức GitHub kèm tooltip tên tổ chức.
class OrganizationList extends Component {
  render() {
    const logos = this.props.logos || [];

    return (
      <div className="organizations-main-div">
        <ul className="dev-icons-orgs">
          {logos.map((logo) => {
            return (
              <OverlayTrigger
                key={logo["login"]}
                placement={"top"}
                style={{ marginBottom: "5px" }}
                overlay={
                  <Tooltip id={`organization-${logo["login"]}`}>
                    <strong>{logo["login"]}</strong>
                  </Tooltip>
                }
              >
                <li className="organizations-inline" name={logo["login"]}>
                  <Fade direction="up" duration={2000}>
                    <img
                      className="organizations-img"
                      src={logo["avatarUrl"]}
                      alt={logo["login"]}
                    />
                  </Fade>
                </li>
              </OverlayTrigger>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default OrganizationList;
