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
      <footer>
        <div className="container">
          <p>&copy;Tremulator - v{packageJson.version}</p>
        </div>
      </footer>
    );
  }
}

export default Footer;
