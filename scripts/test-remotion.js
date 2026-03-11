async function testRender() {
    try {
        const response = await fetch("http://localhost:3000/api/render/remotion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                logoUrl: "https://remotion-assets.s3.eu-central-1.amazonaws.com/logo-8gR8z.png",
            }),
        });

        const data = await response.json();
        console.log("Render Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Test Error:", error);
    }
}

testRender();
