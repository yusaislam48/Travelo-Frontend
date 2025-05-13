# Travelo Frontend

A modern, responsive web application for planning your travels with AI-powered features, beautiful UI, and real-time integrations.

## Features

- 🗺️ Interactive trip planner with map view
- 🤖 AI-generated day-by-day itineraries
- 🌤️ Real-time weather widget
- 🏨 Hotel and 🍽️ restaurant recommendations
- 🖼️ Image search for destinations
- 💬 Integrated AI chatbot for travel queries
- 🌐 Multi-language and 💱 multi-currency support
- 📱 Mobile-friendly, modern UI

## Tech Stack

- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5
- Font Awesome
- [marked.js](https://github.com/markedjs/marked) for Markdown parsing
- Google Maps JavaScript API
- OpenWeather API (via backend)
- OpenAI API (via backend)

## Setup & Usage

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yusaislam48/travelo-frontend.git
   cd travelo-frontend
   ```

2. **Install dependencies:**
   (No build step required; all dependencies are loaded via CDN.)

3. **Configure backend URL:**
   - The frontend is pre-configured to use the deployed backend at:
     ```
     https://travelo-backend-production-454e.up.railway.app
     ```
   - If you want to use a local backend, update the API URLs in `js/main.js` and `js/chatbot.js`.

4. **Run locally:**
   - You can open `index.html` directly in your browser, or use a simple HTTP server:
     ```bash
     npx serve .
     # or
     python3 -m http.server
     ```

5. **Navigate the app:**
   - `index.html`: Home page
   - `planner.html`: Trip planner (main feature)
   - `image-search.html`: Destination image search

## Folder Structure

```
Travelo_frontend/
├── css/
│   └── chatbot.css
├── js/
│   ├── main.js
│   └── chatbot.js
├── index.html
├── planner.html
├── image-search.html
├── README.md
```

## Deployment

- The frontend can be deployed on any static hosting service (Vercel, Netlify, GitHub Pages, etc.).
- Ensure CORS is enabled on the backend for your frontend domain.

## Customization

- **Branding & Colors:** Edit CSS variables in `<style>` tags or `css/chatbot.css`.
- **API Endpoints:** Update backend URLs in JS files if needed.
- **Languages & Currencies:** Add/remove options in the HTML `<select>` elements.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/travelo-frontend
