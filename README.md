# Node.js Hello World Project with Cloudflare

## Introduction
This is a simple Node.js Hello World project that demonstrates how to set up a basic app and deploy it using Cloudflare.

## Prerequisites
- Node.js (version 14 or later)
- npm (Node Package Manager)
- A Cloudflare account

## Setup Instructions

1. **Clone the Repository**  
   First, clone the repository to your local machine:
   ```bash
   git clone https://github.com/kamleshcdk-ctrl/testvmadmin.git
   cd testvmadmin
   ```

2. **Install Dependencies**  
   In the project directory, run the following command to install the necessary dependencies:
   ```bash
   npm install
   ```

3. **Create Entry Point**  
   Create a file named `server.js` in the root of the project with the following content:
   ```javascript
   const http = require('http');

   const hostname = 'localhost';
   const port = 3000;

   const server = http.createServer((req, res) => {
     res.statusCode = 200;
     res.setHeader('Content-Type', 'text/plain');
     res.end('Hello World\n');
   });

   server.listen(port, hostname, () => {
     console.log(`Server running at http://${hostname}:${port}/`);
   });
   ```

4. **Run the Application**  
   Start the application by running:
   ```bash
   node server.js
   ```
   Open your browser and navigate to `http://localhost:3000` to see the message "Hello World".

5. **Deploy on Cloudflare**  
   - Sign in to your Cloudflare account.
   - Create a new project and link your GitHub repository.
   - Set up the deployment settings to point to your `server.js` file.
   - Ensure your domain is pointing to Cloudflare's nameservers.

## Conclusion
You now have a basic Node.js Hello World application running on Cloudflare!