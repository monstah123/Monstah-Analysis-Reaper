
/**
 * Institutional Economic Calendar Proxy (Vercel API)
 * Fetches high-impact news results from Forex Factory XML feed.
 * We use this to bypass CORS and provide structured JSON to the frontend.
 */
export default async function handler(req, res) {
  try {
    const response = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.xml', {
      headers: { 'User-Agent': 'Monstah-Analysis-Reaper/1.0' }
    });
    
    if (!response.ok) throw new Error(`External Feed Error: ${response.status}`);
    
    const xml = await response.text();
    
    // Manual XML parsing into JSON (simple structure)
    // <event>
    //   <title>CPI m/m</title>
    //   <country>USD</country>
    //   <date>05-15-2024</date>
    //   <time>8:30am</time>
    //   <impact>High</impact>
    //   <forecast>0.3%</forecast>
    //   <previous>0.4%</previous>
    //   <actual>0.3%</actual>
    // </event>
    
    const events = [];
    const eventRegex = /<event>([\s\S]*?)<\/event>/g;
    let match;
    
    while ((match = eventRegex.exec(xml)) !== null) {
      const content = match[1];
      const getVal = (tag) => {
        const r = new RegExp(`<${tag}>(.*?)<\/${tag}>`);
        const m = content.match(r);
        return m ? m[1].trim() : '';
      };
      
      const event = {
         title: getVal('title'),
         country: getVal('country'),
         date: getVal('date'),
         time: getVal('time'),
         impact: getVal('impact'),
         forecast: getVal('forecast'),
         previous: getVal('previous'),
         actual: getVal('actual')
      };
      
      // Calculate impact class for UI
      if (event.actual) {
         // Naive logic: if actual > forecast, it's 'better' for most USD data (except unemployment/etc)
         // In a real institutional app, you'd have a map of which events are 'bad' when high (e.g. unemployment)
         const actNum = parseFloat(event.actual.replace(/[^0-9.-]+/g, ""));
         const forNum = parseFloat(event.forecast.replace(/[^0-9.-]+/g, ""));
         
         if (!isNaN(actNum) && !isNaN(forNum)) {
            if (actNum > forNum) event.score = 'better';
            else if (actNum < forNum) event.score = 'worse';
            else event.score = 'inline';
         } else {
            event.score = 'inline';
         }
         
         // Fix impact logic for Unemployment Rate (low is good)
         if (event.title.toLowerCase().includes('unemployment') || event.title.toLowerCase().includes('claims')) {
            if (event.score === 'better') event.score = 'worse';
            else if (event.score === 'worse') event.score = 'better';
         }
      }

      events.push(event);
    }
    
    // Sort and filter: Only high impact and those with 'actual' values (since we want a result tracker)
    const results = events
      .filter(e => e.impact === 'High' && e.actual)
      .slice(-10) // Last 10 results
      .reverse(); // Newest first

    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('[API Calendar] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
