const fs = require("fs");
const path = require("path");

const rawProducts = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "raw-products.json"),
    "utf-8"
  )
);

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const skuPrefixes = {
  clothing: "CLO",
  footwear: "FTW",
  electronics: "ELC",
  kitchen: "KIT",
  home: "HOM",
  beauty: "BTY",
  sports: "SPT",
  general: "GEN"
};

function generateSku(product, index) {
  const category = product.category || "general";
  const prefix = skuPrefixes[category] || "GEN";
  return `${prefix}-${String(index + 1).padStart(4, "0")}`;
}

function generateRating() {
  const starsOptions = [3.5, 4, 4.5, 5];
  const stars =
    starsOptions[Math.floor(Math.random() * starsOptions.length)];

  return {
    stars,
    count: randomBetween(20, 5000)
  };
}

function randomStock() {
  return randomBetween(20, 200);
}

function randomDiscount() {
  return randomBetween(5, 35);
}

function buildDescription(product) {
  return `${product.name} designed for quality, comfort and durability.`;
}

function generateSpecs(product) {
  const category = product.category || "general";

  switch (category) {
    case "clothing":
      return {
        material: "Cotton Blend",
        fit: "Regular Fit",
        color: detectColor(product.image)
      };

    case "footwear":
      return {
        material: "Mesh + Rubber",
        sole: "Anti-slip",
        closure: "Lace-up"
      };

    case "electronics":
      return {
        warranty: "12 Months",
        power: "220V",
        brand: product.brand || "DyDx"
      };

    default:
      return {};
  }
}

function generateBrand(product) {
  if (product.brand) return product.brand;

  const category = product.category || "general";

  const brandMap = {
    clothing: "DyDx Essentials",
    footwear: "DyDx Sport",
    electronics: "DyDx Tech",
    beauty: "DyDx Beauty",
    home: "DyDx Home",
    kitchen: "DyDx Kitchen"
  };

  return brandMap[category] || "DyDx";
}

function detectColor(imagePath) {
  const colors = [
    "Black", "White", "Purple", "Gold", "Grey",
    "Blue", "Red", "Green", "Pink",
    "Silver", "Beige", "Brown", "Yellow"
  ];

  const lower = imagePath.toLowerCase();

  for (const color of colors) {
    if (lower.includes(color.toLowerCase())) {
      return color;
    }
  }

  return "Standard";
}

function buildProduct(product, index) {
  const discount = randomDiscount();

  const originalPrice = Math.round(
    product.priceCents / (1 - discount / 100)
  );

  if (!product.id) {
    throw new Error(`Missing product id for ${product.name}`);
  }

  return {
    id: product.id,
    sku: generateSku(product, index),

    name: product.name,
    brand: generateBrand(product),
    category: product.category || "general",

    image: product.image,
    images: [product.image],

    rating: generateRating(),

    priceCents: product.priceCents,
    originalPriceCents: originalPrice,
    discountPercent: discount,

    stock: randomStock(),

    description: buildDescription(product),
    specs: product.specs || generateSpecs(product),

    featured: Math.random() > 0.7,
    createdAt: Math.floor(Date.now() / 1000),

    sizeChartLink:
      product.category === "clothing"
        ? "images/clothing-size-chart.png"
        : "",

    instructionsLink: "",
    warrantyLink: "",

    keywords: product.keywords || []
  };
}

const transformed = rawProducts.map(buildProduct);

fs.writeFileSync(
  path.join(__dirname, "generated-products.json"),
  JSON.stringify(transformed, null, 2)
);

console.log("✅ generated-products.json created successfully");