# Rate-Limited API Example

This project demonstrates an Express.js application that implements rate-limiting using Redis for task queuing. The app limits API calls to 1 task per second and 20 tasks per minute per user ID.

## Steps to Run the Application

### 1. Initialize the Project
Run the following command to create a `package.json` file for the project: 
```bash
npm init -y 
````
### 2. Install Required Dependencies
Install the necessary packages:
```bash
npm install  
````
### 3. Start the Application
To run the application, use the following command:
```bash
nodemon index.js 
````


