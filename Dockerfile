FROM node:14
# Set the working directory in the container
WORKDIR /app

ENV DB_HOST= "130.237.83.249:2511"
ENV USERNAME=root
ENV PASSWORD=12345679

# Copy only the files needed for database setup
COPY package*.json ./
COPY dbsetup.js ./

# Install project dependencies
RUN npm install

# Run the database setup script
RUN node dbsetup.js

# Copy the rest of the application code into the container
COPY . .

# Build the React application for production
#RUN npm run build

# Expose the port your React application will be served on
EXPOSE 5004

CMD ["npm", "run", "startServer"]
