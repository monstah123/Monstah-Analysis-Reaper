import fetch from 'node-fetch';

async function test() {
    try {
        const response = await fetch('http://localhost:3000/api/sentiment');
        const data = await response.json();
        console.log('GBP/USD Data:', data.sentiment['GBP/USD']);
        console.log('EUR/USD Data:', data.sentiment['EUR/USD']);
        console.log('USD/JPY Data:', data.sentiment['USD/JPY']);
        console.log('GBP/JPY Data (Derived):', data.sentiment['GBP/JPY']);
    } catch (e) {
        console.log('Error fetching:', e.message);
    }
}

test();
