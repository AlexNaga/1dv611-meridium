# Arkivdium
## About
A live demo of this application can be found at [http://dv-rpi2.lnu.se](http://dv-rpi2.lnu.se:3000)

## Running the Application
This application depends on [httrack](http://www.httrack.com), that must be installed before you can actually use this application.  

1. Clone this repository or download the [.zip](https://github.com/1dv611-meridium/1dv611-meridium/archive/master.zip) file.
2. Extract folder to preferred location.

  ### Starting the server
  1. Open up the terminal in the folder.
  2. Install the required dependencies by typing `npm install`
  3. Create the environment variables by typing the following in the terminal
  ```bash
  echo '{
    EMAIL_USER="YOUR_EMAIL"
    EMAIL_PASS="YOUR_EMAIL_PASSWORD"
    IS_RUNNING_LINUX_OS="true"
    JWT_SECRET="A_RANDOM_SECRET"
    MONGODB_ATLAS_PASSWORD="YOUR_MONGODB_PASSWORD"
    SERVER_DOMAIN="http://localhost:3000"
    SESSION_SECRET="A_RANDOM_SECRET"
    ARCHIVES_FOLDER="archives"
  }' > .env
  ```
  4. Start the application by typing `npm start` (or `npm run dev` for development)
  5. The application is now running at [http://localhost:3000](http://localhost:3000)
