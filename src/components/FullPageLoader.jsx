import React, { useState, useEffect } from "react";
import { BlinkBlur } from "react-loading-indicators";
import "./FullPageLoader.css";

const FullPageLoader = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAllResourcesLoaded = async () => {
      // ✅ Wait for all images
      const images = Array.from(document.images);
      const imagePromises = images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve();
            else img.onload = img.onerror = resolve;
          })
      );

      // ✅ Wait for all fonts
      const fontPromise = document.fonts.ready;

      // ✅ Wait for React content to render fully
      await Promise.all([...imagePromises, fontPromise]);

      // ✅ Small delay for smooth fade-out
      setTimeout(() => setLoading(false), 300);
    };

    // Check if page is already fully loaded
    if (document.readyState === "complete") {
      checkAllResourcesLoaded();
    } else {
      window.addEventListener("load", checkAllResourcesLoaded);
    }

    return () => window.removeEventListener("load", checkAllResourcesLoaded);
  }, []);

  if (loading) {
    return (
      <div className="loader-wrapper">
        <BlinkBlur
          color="#32cd32"
          size="medium"
          text="Loading News..."
          textColor="#333"
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default FullPageLoader;