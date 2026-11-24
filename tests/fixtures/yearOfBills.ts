// Twelve consecutive monthly CFE bills for a home in a hot climate: consumption
// peaks in summer because of air conditioning.
export const yearOfBills = [
  { start: "11/11/2025", end: "11/12/2025", kwh: "210", amount: "$412.50" },
  { start: "11/12/2025", end: "11/01/2026", kwh: "205", amount: "$398.20" },
  { start: "11/01/2026", end: "11/02/2026", kwh: "198", amount: "$381.90" },
  { start: "11/02/2026", end: "11/03/2026", kwh: "230", amount: "$455.10" },
  { start: "11/03/2026", end: "11/04/2026", kwh: "280", amount: "$618.40" },
  { start: "11/04/2026", end: "11/05/2026", kwh: "340", amount: "$842.70" },
  { start: "11/05/2026", end: "11/06/2026", kwh: "390", amount: "$1,036.80" },
  { start: "11/06/2026", end: "11/07/2026", kwh: "410", amount: "$1,118.30" },
  { start: "11/07/2026", end: "11/08/2026", kwh: "380", amount: "$998.60" },
  { start: "11/08/2026", end: "11/09/2026", kwh: "300", amount: "$689.20" },
  { start: "11/09/2026", end: "11/10/2026", kwh: "240", amount: "$478.90" },
  { start: "11/10/2026", end: "11/11/2026", kwh: "215", amount: "$421.30" },
];

// Local test account used to preview the dashboard with a full year of data.
export const yearTestAccount = {
  email: "prueba.anual@ahorrawatt.test",
  password: "AhorraWatt2026",
};

// A home whose consumption keeps rising through the year and ends with a worse
// month than the previous one.
export const badYearOfBills = [
  { start: "11/11/2025", end: "11/12/2025", kwh: "260", amount: "$589.00" },
  { start: "11/12/2025", end: "11/01/2026", kwh: "275", amount: "$634.00" },
  { start: "11/01/2026", end: "11/02/2026", kwh: "290", amount: "$682.00" },
  { start: "11/02/2026", end: "11/03/2026", kwh: "320", amount: "$798.00" },
  { start: "11/03/2026", end: "11/04/2026", kwh: "365", amount: "$987.00" },
  { start: "11/04/2026", end: "11/05/2026", kwh: "420", amount: "$1,243.00" },
  { start: "11/05/2026", end: "11/06/2026", kwh: "480", amount: "$1,536.00" },
  { start: "11/06/2026", end: "11/07/2026", kwh: "530", amount: "$1,789.00" },
  { start: "11/07/2026", end: "11/08/2026", kwh: "545", amount: "$1,864.00" },
  { start: "11/08/2026", end: "11/09/2026", kwh: "500", amount: "$1,628.00" },
  { start: "11/09/2026", end: "11/10/2026", kwh: "480", amount: "$1,512.00" },
  { start: "11/10/2026", end: "11/11/2026", kwh: "520", amount: "$1,715.00" },
];
