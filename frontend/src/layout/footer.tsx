import React from "react";
import packageJson from "../package.alias.json";

/**
 * Display the application footer.
 */
export const Footer: React.FC = () => {
  return (
    <footer>
      <div className="container-fluid d-flex justify-content-center">
        <span>&copy;Tremulator - v{packageJson.version} - This server is hosted by Florida State University.</span>
      </div>
    </footer>
  );
};
