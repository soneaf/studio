import { prisma } from '../lib/prisma';

async function main() {
    await prisma.cocktail.createMany({
        data: [
            {
                timestamp: new Date("2025-12-15T20:00:00.000Z"),
                recipeName: "Sunset Boulevard",
                sku: "Reposado",
                glassware: "Rocks Glass",
                ice: "Large Cube",
                garnishes: "Orange Peel (rim); Cherry (in-glass)",
                background: "Warm Sunset",
                countertop: "Wooden Bar",
                showBottle: true,
                finalPrompt: "A beautiful sunset cocktail..."
            },
            {
                timestamp: new Date("2025-12-14T18:30:00.000Z"),
                recipeName: "Midnight Rain",
                sku: "Blanco",
                glassware: "Highball",
                ice: "Crushed Ice",
                garnishes: "Lime Wedge (rim)",
                background: "Dark Studio",
                countertop: "Marble",
                showBottle: false,
                finalPrompt: "A moody dark cocktail..."
            },
            {
                timestamp: new Date("2025-12-13T15:15:00.000Z"),
                recipeName: "Spicy Mango",
                sku: "Jalapeno",
                glassware: "Coupe",
                ice: "No Ice",
                garnishes: "Chili Salt (rim); Jalapeno Slice (float)",
                background: "Bright Beach",
                countertop: "Sand",
                showBottle: true,
                finalPrompt: "A spicy mango margarita..."
            }
        ]
    });
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
