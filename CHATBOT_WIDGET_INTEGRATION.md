# AI Health Assistant Widget - Integration Guide

## Overview

This is a standalone chatbot widget that can be easily integrated into any website. The widget connects to the AI Health Assistant API and provides intelligent responses about animal diseases and treatments.

## Features

✅ **Complete Implementation of All Requirements:**

### UI & Placement
- ✅ Circular chatbot icon fixed to bottom-right corner
- ✅ Toggle floating chat window with smooth animations
- ✅ Header: "AI Health Assistant"
- ✅ Scrollable conversation area
- ✅ Text input + Send button
- ✅ Modern CSS with rounded corners, shadows, and responsive design

### Messaging Behavior
- ✅ Message trimming and validation
- ✅ In-memory cache (Map) for instant responses
- ✅ localStorage persistence across page reloads
- ✅ API integration with specified endpoint
- ✅ Duplicate request prevention with debouncing
- ✅ Proper error handling with retry functionality

### Caching System
- ✅ Message normalization (case-insensitive, whitespace/punctuation insensitive)
- ✅ Two-tier caching: in-memory + localStorage
- ✅ Cache size limit (200 entries)
- ✅ Visual "cached" badge for cached responses

### UX Features
- ✅ Auto-scroll to newest messages
- ✅ Typing indicator ("Bot is typing...")
- ✅ Cached response labeling
- ✅ Mobile-responsive design
- ✅ Smooth open/close animations

## Quick Integration

### Method 1: Direct HTML Include
Simply include the widget HTML file in your website:

```html
<!-- Add this to your HTML page -->
<iframe src="chatbot-widget.html" 
        style="position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; border: none; z-index: 10000;">
</iframe>
```

### Method 2: Copy Widget Code
Copy the entire content of `chatbot-widget.html` and paste it at the end of your HTML page, just before the closing `</body>` tag.

### Method 3: JavaScript Integration
```html
<script>
// Load the chatbot widget dynamically
fetch('chatbot-widget.html')
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const widget = doc.querySelector('.chatbot-widget');
        if (widget) {
            document.body.appendChild(widget);
        }
    });
</script>
```

## API Configuration

The widget is pre-configured to connect to:
```
https://reclosable-atomistically-tashina.ngrok-free.dev/chat
```

### API Request Format
```javascript
POST https://reclosable-atomistically-tashina.ngrok-free.dev/chat
Headers: {
    "Content-Type": "application/json"
}
Body: {
    "message": "user message here"
}
```

### API Response Handling
The widget handles multiple response formats:
- `data.answer` - Direct answer
- `data.answers[0].answer` - First answer from array
- `data.message` - Message field
- `data.response` - Response field

## CORS Configuration

If you encounter CORS errors, ensure your server has CORS enabled:

### Flask (Python)
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
```

### Express.js (Node.js)
```javascript
const cors = require('cors');
app.use(cors());
```

### Django (Python)
```python
# settings.py
CORS_ALLOW_ALL_ORIGINS = True
# or specify allowed origins
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://yourdomain.com",
]
```

## Customization

### Changing the API Endpoint
Edit the `apiEndpoint` property in the JavaScript:

```javascript
this.apiEndpoint = 'https://your-new-api-endpoint.com/chat';
```

### Styling Customization
The widget uses CSS custom properties and can be easily styled by overriding the CSS classes:

```css
.chatbot-toggle {
    background: linear-gradient(135deg, #your-color-1, #your-color-2);
}

.chatbot-header {
    background: linear-gradient(135deg, #your-header-color-1, #your-header-color-2);
}
```

### Cache Configuration
Adjust cache settings in the JavaScript:

```javascript
this.maxCacheSize = 200; // Maximum number of cached entries
```

## Testing

1. Open `test-widget.html` in your browser
2. Click the chat icon in the bottom-right corner
3. Try asking questions like:
   - "What are the symptoms of fever in animals?"
   - "How to treat diarrhea in calves?"
   - "What causes watery eyes in animals?"

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure

```
veterinary-website/
├── chatbot-widget.html          # Main widget file
├── test-widget.html             # Test page
└── CHATBOT_WIDGET_INTEGRATION.md # This guide
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your API server has CORS enabled
2. **Widget Not Loading**: Check browser console for JavaScript errors
3. **API Not Responding**: Verify the API endpoint URL is correct
4. **Cache Not Working**: Check if localStorage is enabled in the browser

### Debug Mode
Open browser developer tools and check the console for detailed logging of API requests and responses.

## Support

For issues or questions about the widget integration, check:
1. Browser console for error messages
2. Network tab for API request/response details
3. Ensure the API endpoint is accessible and responding correctly

## License

This widget is provided as-is for integration into your veterinary website project.
