import React from "react";
import packageJson from "../package.alias.json";

/**
 * Display the application footer.
 */
class Footer extends React.Component {
  /**
   * Render.
   */
  render() {
    return (
      <footer className="footer">
        <div className="container">
          <span>&copy;Tremulator - v{packageJson.version} - This server is hosted by Florida State University.</span>
        </div>
      </footer>
    );
  }
}

export default Footer;
