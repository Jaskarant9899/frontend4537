document.getElementById('quoteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const prompt = document.getElementById('prompt').value;
    const data = { prompt: prompt };

    fetch('/generate-quote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('quote').textContent = data.quote; 
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById('quote').textContent = 'Error generating quote.';
    });
});
