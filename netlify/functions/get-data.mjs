export default async (req, context) => {
    // Only allow POST requests
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        // Parse the request body
        const body = await req.json();
        const { password } = body;

        // Get secrets from environment variables
        const CORRECT_PASSWORD = Netlify.env.get("APP_PASSWORD");
        const SHEET_URL = Netlify.env.get("SHEET_URL");

        // Verify Password
        if (!password || password !== CORRECT_PASSWORD) {
            // Artificial delay to prevent brute-forcing
            await new Promise(resolve => setTimeout(resolve, 1000));
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (!SHEET_URL) {
            return new Response(JSON.stringify({ error: "Server Configuration Error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Fetch the data from Google Sheets
        const response = await fetch(SHEET_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch sheet: ${response.statusText}`);
        }

        const csvData = await response.text();

        // Return the CSV data
        return new Response(csvData, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Cache-Control": "no-store, max-age=0", // Don't cache sensitive data
            }
        });

    } catch (error) {
        console.error("Error in get-data function:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
