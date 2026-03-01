-- CreateTable
CREATE TABLE "Cocktail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipeName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "glassware" TEXT NOT NULL,
    "ice" TEXT NOT NULL,
    "garnishes" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "countertop" TEXT NOT NULL,
    "showBottle" BOOLEAN NOT NULL,
    "finalPrompt" TEXT NOT NULL
);
