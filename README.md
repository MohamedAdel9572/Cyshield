# Cyshield Authentication and Authorization API

This project provides an API for managing user authentication, authorization, and related operations. It includes endpoints for user management, subnet management, and IP management.

## Project Description

The goal of this task is to create a Full-Stack Web Application using SQL Server, ASP.NET Core API, and Angular for the frontend. 
The application should allow users to register, log in, upload files containing subnets, and perform CRUD operations on subnets and their associated IPs.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: npm is distributed with Node.js. Make sure you have it installed.
- **SQL Server**: Ensure you have a SQL Server instance running.
- **Internet Information Service (IIS)**: Ensure you have IIS installed.
- **Postman**: It's good to have Postman to test your APIs.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MohamedAdel9572/Cyshield.git
  

2. Install npm

## Configuration

1.Environment Variables:
DB_CONNECTION_STRING= "Data Source=.;Initial Catalog=cyshield;User ID=Hoppas;Password=hoppas98"
JWT_SECRET="dGhpcyBpcyBhIHNlY3JldCBrZXkgZm9yIGp3dCBhdXRoZW50aWNhdGlvbg=="

2. Database Setup:
Run the SQL scripts provided in the database directory to create the necessary tables.

## Running the Application:
1. Access the API:

The API will be available at http://localhost:9040

Deployemnent Steps:
Install IIS (Internet Information Service):

Ensure IIS is installed on your server.

Add Website:

a. Open IIS Manager and add a new website.

b. Configure Website:

	Fill in the necessary details (e.g., site name, physical path, bindings).

c. Publish Backend:

	Any change you make in your backend, you have to publish.

d. Copy Published Files:

	Copy the published folder to the content directory's physical path.

e. Restart IIS:

	Stop and start the service again to apply changes.

2. API Endpoints
Authentication
POST /api/Auth/Register - Register a new user.

POST /api/Auth/login - Login a user.

POST /api/Auth/verify-token - Verify a JWT token.

Subnets
GET /api/FileUpload/subnets - Get all subnets.

GET /api/FileUpload/subnet/:subnetId - Get all subnets by username.

GET /api/FileUpload/subnet/:subnetId - Get a subnet by ID.

PUT /api/FileUpload/subnets_update/ - Update a subnet 

DELETE /api/FileUpload/subnets_delete/:subnetId - Delete a subnet by ID.

IPs
GET /api/FileUpload/ips/{username} - Get all IPs of the current user.

GET /api/FileUpload/ip/{ipId} - get the data of ip data to modify it.

PUT /api/FileUpload/ips/ip_update - Update data of the ip.

DELETE /api/FileUpload/ips/ip_delete/{ip} - delete data of the ip.

File Upload
POST /api/FileUpload/upload/:username - Upload a file.

##Database Schema
Users Table
CREATE TABLE [dbo].[Users](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [Username] [nvarchar](255) NOT NULL,
    [Email] [nvarchar](255) NOT NULL,
    [Password] [nvarchar](255) NOT NULL,
    [Role] [nvarchar](255) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
)

Subnets Table
CREATE TABLE [dbo].[Subnets](
    [SubnetId] [int] IDENTITY(1,1) NOT NULL,
    [SubnetName] [nvarchar](255) NOT NULL,
    [SubnetAddress] [nvarchar](255) NOT NULL,
    [CreatedBy] [int] NOT NULL,
    [CreatedAt] [datetime] NULL,
    PRIMARY KEY CLUSTERED ([SubnetId] ASC)
)

IPs Table
CREATE TABLE [dbo].[IPs](
    [IpId] [int] IDENTITY(1,1) NOT NULL,
    [IpAddress] [nvarchar](255) NOT NULL,
    [SubnetId] [int] NOT NULL,
    [CreatedBy] [int] NOT NULL,
    [CreatedAt] [datetime] NULL,
    PRIMARY KEY CLUSTERED ([IpId] ASC),
    FOREIGN KEY ([SubnetId]) REFERENCES [dbo].[Subnets]([SubnetId]) ON DELETE CASCADE
)

Indexing
Cluster and Non-Cluster Indexes:

It's recommended to create clustered and non-clustered indexes to improve data retrieval and modification performance.

## License

This `README.md` file provides a comprehensive guide on how to set up, run, and use your project. It includes sections on prerequisites, installation, configuration, running the application, 
API endpoints, database schema, contributing, and licensing. The API endpoints and database schema sections have been updated to reflect the specific endpoints and tables you mentioned.
