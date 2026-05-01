import { useEffect } from "react";

const AdBanner = () => {
  useEffect(() => {
    // Ad config
    const script1 = document.createElement("script");
    script1.innerHTML = `
      window.atOptions = {
        key: 'd3f804d22fb21269a5bd158109be0082',
        format: 'iframe',
        height: 50,
        width: 320,
        params: {}
      };
    `;

    // Ad loader script
    const script2 = document.createElement("script");
    script2.src =
      "https://insensitiveshoweraudible.com/d3f804d22fb21269a5bd158109be0082/invoke.js";
    script2.async = true;

    document.getElementById("ad-container")?.appendChild(script1);
    document.getElementById("ad-container")?.appendChild(script2);
  }, []);

  return <div id="ad-container" style={{ marginTop: "20px", textAlign: "center" }} />;
};

export default AdBanner;
