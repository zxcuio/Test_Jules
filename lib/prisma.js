const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function saveCalculation(formula, result) {
  try {
    const saved = await prisma.calculationResult.create({
      data: {
        formula: formula,
        result: result,
      },
    });
    console.log('Saved calculation:', saved);
    return saved;
  } catch (error) {
    console.error('Error saving calculation:', error);
    throw error;
  }
}

async function getHistory() {
  try {
    const history = await prisma.calculationResult.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
    return history;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
}

// Example usage check (only runs if executed directly)
if (require.main === module) {
  // Simple test to verify connection (requires DB to be running)
  getHistory()
    .then((data) => console.log('History:', data))
    .catch((e) => console.error(e))
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = {
  prisma,
  saveCalculation,
  getHistory,
};
