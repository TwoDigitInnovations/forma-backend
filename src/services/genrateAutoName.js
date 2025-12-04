const generateDocumentName = (type) => {
  const formattedType =
    type
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formattedType} - ${dateStr}`;
};

module.exports = generateDocumentName;
