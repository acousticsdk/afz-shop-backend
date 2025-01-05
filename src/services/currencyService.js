import fetch from 'node-fetch';

const formatRate = (rate, isKZT = false) => {
  if (rate === null) return null;
  return isKZT ? Number(rate.toFixed(6)) : Number((1 / rate).toFixed(6));
};

const getCurrencyRate = async (pair, count = 5) => {
  const url = `${process.env.STEAM_CURRENCY_API_URL}${pair}?count=${count}`;
  
  const response = await fetch(url, {
    headers: {
      'api-token': process.env.STEAM_CURRENCY_API_TOKEN,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) return null;

  const data = await response.json();
  if (!data.data?.length) return null;

  // Sort by created_at and get latest rate
  const sortedData = data.data.sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  return sortedData[0]?.close_price ? Number(sortedData[0].close_price) : null;
};

export const getCurrencyRates = async () => {
  try {
    const [usdRate, kztRate] = await Promise.all([
      getCurrencyRate('USD:RUB'),
      getCurrencyRate('RUB:KZT')
    ]);

    const currencies = [];

    if (usdRate !== null) {
      currencies.push({
        code: 'USD',
        rate: formatRate(usdRate)
      });
    }

    if (kztRate !== null) {
      currencies.push({
        code: 'KZT',
        rate: formatRate(kztRate, true)
      });
    }

    // Fallback rates if API fails
    if (currencies.length === 0) {
      currencies.push(
        { code: 'KZT', rate: 4.75 },
        { code: 'USD', rate: 0.0091 }
      );
    }

    return { data: { currencies } };
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    throw error;
  }
};