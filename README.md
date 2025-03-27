
## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (version 16.x or higher recommended)
*   npm (version 8.x or higher) or yarn

### Installation & Running Locally

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <your-repository-url>
    cd ccm-tool
    ```
    *(If you received the code directly, just navigate to the project directory)*

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

3.  **Start the development server:**
    ```bash
    npm start
    ```
    or
    ```bash
    yarn start
    ```
    This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will automatically reload if you make changes to the code.

## Available Scripts

In the project directory, you can run:

*   `npm start` / `yarn start`: Runs the app in development mode.
*   `npm run build` / `yarn build`: Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.
*   `npm test` / `yarn test`: Launches the test runner in interactive watch mode (if tests are configured).
*   `npm run eject` / `yarn eject`: **Note:** this is a one-way operation. Once you eject, you can't go back! It copies all configuration files and transitive dependencies into your project so you have full control over them. Use with caution.

## Deployment to GitHub Pages (Optional)

This app is suitable for deployment as a static site on GitHub Pages.

1.  **Set `homepage` in `package.json`:**
    Update the `homepage` field with your GitHub Pages URL:
    ```json
    "homepage": "https://<your-github-username>.github.io/<your-repository-name>"
    ```

2.  **Install `gh-pages`:**
    ```bash
    npm install --save-dev gh-pages
    # or
    yarn add --dev gh-pages
    ```

3.  **Add Deploy Scripts:**
    Add `predeploy` and `deploy` scripts to your `package.json`:
    ```json
     "scripts": {
       // ... other scripts
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
    ```

4.  **Deploy:**
    Commit your changes and run:
    ```bash
    npm run deploy
    # or
    yarn deploy
    ```

5.  **Configure GitHub Repository:**
    *   Go to Repository Settings -> Pages.
    *   Set the source branch to `gh-pages` and the folder to `/ (root)`.
    *   Your site should be live shortly at the URL specified in `homepage`.

## Contributing

(In Progress)

## License

Private