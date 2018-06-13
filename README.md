# Arkivdium
## About
This repository was created for the course 1DV611: Team-based Software Development Project. Linnaeus University, Sweden.

A live demo of this application can be found at [http://dv-rpi2.lnu.se](http://dv-rpi2.lnu.se:3000)

## Running the Application
This application depends on [httrack](http://www.httrack.com), that must be installed before you can actually use this application.  

1. Clone this repository or download the [.zip](https://github.com/1dv611-meridium/1dv611-meridium/archive/master.zip) file.
2. Extract folder to preferred location.

  ### Starting the server
  1. Open up the terminal in the folder.
  2. Install the required dependencies by typing `npm install`
  3. Create a `.env` file for the environment variables, with the following content
  ``` js
  {
    SERVER_DOMAIN="http://localhost:3000"
    EMAIL_PASS="YOUR_EMAIL_PASSWORD"
    EMAIL_USER="YOUR_EMAIL"
    IS_RUNNING_LINUX_OS="SET_TO_true_OR_false"
    JWT_SECRET="A_RANDOM_SECRET"
    MONGODB="YOUR_MONGODB_CONNECTION_STRING"
    SESSION_SECRET="A_RANDOM_SECRET"
    PORT=3000
    ARCHIVES_FOLDER="archives"
    PREVIEWS_FOLDER="previews"    
  }
  ```
  4. Start the application by typing `npm start` (or `npm run dev` for development)
  5. The application is now running at [http://localhost:3000](http://localhost:3000)

  ### Build for production
  - Build the client files for production by typing `npm run build`

  This will create a folder named `dist` (stands for *distribution*). The folder will include a bundled / minified version of the JavaScript and CSS.
